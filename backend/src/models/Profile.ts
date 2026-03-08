import pool from '../config/database';
import { PoolClient } from 'pg';
import {
  Profile,
  ProfileWithDetails,
  CreateProfileInput,
  UpdateProfileInput,
  Interest,
  ProfilePicture,
  PublicProfile,
  BrowseFilters,
  SearchFilters,
  UserProfile,
  ProfileView,
  Like,
  Connection,
  Block,
  Report
} from '../types';

export class ProfileModel {
  // Profile CRUD operations
  static async createProfile(userId: string, profileData: CreateProfileInput): Promise<Profile> {
    // Use coordinates directly from frontend - no geocoding needed
    const finalLatitude = profileData.latitude;
    const finalLongitude = profileData.longitude;

    const query = `
      INSERT INTO profiles (user_id, gender, sexual_preference, bio, date_of_birth, latitude, longitude, 
                           location_source, neighborhood, completeness)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, user_id as "userId", gender, sexual_preference as "sexualPreference", 
                bio, date_of_birth as "dateOfBirth", fame_rating as "fameRating", latitude, longitude, 
                location_source as "locationSource", neighborhood, completeness,
                created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    // Calculate completeness manually with the final coordinates
    let completeness = 0;
    if (profileData.gender) completeness += 10;
    if (profileData.sexualPreference) completeness += 10;
    if (profileData.bio && profileData.bio.length > 20) completeness += 20;
    if (profileData.dateOfBirth) completeness += 10;
    if ((finalLatitude && finalLongitude) || profileData.neighborhood) completeness += 20;
    
    const values = [
      userId,
      profileData.gender,
      profileData.sexualPreference,
      profileData.bio,
      profileData.dateOfBirth,
      finalLatitude,
      finalLongitude,
      profileData.locationSource || 'manual',
      profileData.neighborhood,
      completeness
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getProfileByUserId(userId: string): Promise<ProfileWithDetails | null> {
    const client = await pool.connect();
    try {
      // Get basic profile
      const profileQuery = `
        SELECT id, user_id as "userId", gender, sexual_preference as "sexualPreference", 
               bio, date_of_birth as "dateOfBirth", fame_rating as "fameRating", latitude, longitude, 
               location_source as "locationSource", neighborhood, completeness,
               created_at as "createdAt", updated_at as "updatedAt"
        FROM profiles WHERE user_id = $1
      `;
      const profileResult = await client.query(profileQuery, [userId]);
      
      if (profileResult.rows.length === 0) {
        return null;
      }
      
      const profile = profileResult.rows[0];

      // Get interests
      const interestsQuery = `
        SELECT i.id, i.name
        FROM interests i
        JOIN profile_interests pi ON i.id = pi.interest_id
        WHERE pi.profile_id = $1
      `;
      const interestsResult = await client.query(interestsQuery, [profile.id]);

      // Get pictures
      const picturesQuery = `
        SELECT id, profile_id as "profileId", url, is_profile_pic as "isProfilePic", 
               position, created_at as "createdAt"
        FROM profile_pictures 
        WHERE profile_id = $1 
        ORDER BY is_profile_pic DESC, position ASC
      `;
      const picturesResult = await client.query(picturesQuery, [profile.id]);

      return {
        ...profile,
        interests: interestsResult.rows,
        pictures: picturesResult.rows
      };
    } finally {
      client.release();
    }
  }

  static async updateProfile(userId: string, profileData: UpdateProfileInput): Promise<Profile> {
    const setClause: string[] = [];
    const values: any[] = [userId];
    let paramCount = 2;

    if (profileData.gender !== undefined) {
      setClause.push(`gender = $${paramCount}`);
      values.push(profileData.gender);
      paramCount++;
    }
    if (profileData.sexualPreference !== undefined) {
      setClause.push(`sexual_preference = $${paramCount}`);
      values.push(profileData.sexualPreference);
      paramCount++;
    }
    if (profileData.bio !== undefined) {
      setClause.push(`bio = $${paramCount}`);
      values.push(profileData.bio);
      paramCount++;
    }
    if (profileData.dateOfBirth !== undefined) {
      setClause.push(`date_of_birth = $${paramCount}`);
      values.push(profileData.dateOfBirth);
      paramCount++;
    }

    // Handle location updates - coordinates come directly from frontend
    if (profileData.latitude !== undefined) {
      setClause.push(`latitude = $${paramCount}`);
      values.push(profileData.latitude);
      paramCount++;
    }
    if (profileData.longitude !== undefined) {
      setClause.push(`longitude = $${paramCount}`);
      values.push(profileData.longitude);
      paramCount++;
    }
    if (profileData.locationSource !== undefined) {
      setClause.push(`location_source = $${paramCount}`);
      values.push(profileData.locationSource);
      paramCount++;
    }
    if (profileData.neighborhood !== undefined) {
      setClause.push(`neighborhood = $${paramCount}`);
      values.push(profileData.neighborhood);
      paramCount++;
    }

    // Recalculate completeness
    const completeness = await this.calculateCompletenessForUser(userId, profileData);
    setClause.push(`completeness = $${paramCount}`);
    values.push(completeness);
    paramCount++;

    setClause.push('updated_at = CURRENT_TIMESTAMP');

    const query = `
      UPDATE profiles 
      SET ${setClause.join(', ')}
      WHERE user_id = $1
      RETURNING id, user_id as "userId", gender, sexual_preference as "sexualPreference", 
                bio, date_of_birth as "dateOfBirth", fame_rating as "fameRating", latitude, longitude, 
                location_source as "locationSource", neighborhood, completeness,
                created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Interest management
  static async getOrCreateInterest(name: string): Promise<Interest> {
    const query = 'INSERT INTO interests (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = $1 RETURNING id, name';
    const result = await pool.query(query, [name.toLowerCase().trim()]);
    return result.rows[0];
  }

  static async addInterestsToProfile(profileId: string, interestNames: string[]): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get user ID for this profile
      const userQuery = 'SELECT user_id FROM profiles WHERE id = $1';
      const userResult = await client.query(userQuery, [profileId]);
      const userId = userResult.rows[0]?.user_id;

      for (const name of interestNames) {
        const interest = await this.getOrCreateInterest(name);
        await client.query(
          'INSERT INTO profile_interests (profile_id, interest_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [profileId, interest.id]
        );
      }

      // Update completeness then fame rating after adding interests
      if (userId) {
        await this.updateCompleteness(userId);
        await this.updateFameRating(userId);
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async removeInterestFromProfile(profileId: string, interestId: number): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get user ID for this profile
      const userQuery = 'SELECT user_id FROM profiles WHERE id = $1';
      const userResult = await client.query(userQuery, [profileId]);
      const userId = userResult.rows[0]?.user_id;

      // Remove the interest
      const query = 'DELETE FROM profile_interests WHERE profile_id = $1 AND interest_id = $2';
      await client.query(query, [profileId, interestId]);

      // Update completeness then fame rating after removing interest
      if (userId) {
        await this.updateCompleteness(userId);
        await this.updateFameRating(userId);
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Picture management
  static async addPicture(profileId: string, url: string, isProfilePic = false): Promise<ProfilePicture> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get user ID for this profile
      const userQuery = 'SELECT user_id FROM profiles WHERE id = $1';
      const userResult = await client.query(userQuery, [profileId]);
      const userId = userResult.rows[0]?.user_id;

      // If this is a profile pic, unset any existing profile pic
      if (isProfilePic) {
        await client.query(
          'UPDATE profile_pictures SET is_profile_pic = false WHERE profile_id = $1',
          [profileId]
        );
      }

      // Get next position
      const positionResult = await client.query(
        'SELECT COALESCE(MAX(position), -1) + 1 as next_position FROM profile_pictures WHERE profile_id = $1',
        [profileId]
      );
      const position = positionResult.rows[0].next_position;

      const query = `
        INSERT INTO profile_pictures (profile_id, url, is_profile_pic, position)
        VALUES ($1, $2, $3, $4)
        RETURNING id, profile_id as "profileId", url, is_profile_pic as "isProfilePic", 
                  position, created_at as "createdAt"
      `;
      const result = await client.query(query, [profileId, url, isProfilePic, position]);

      // Update completeness then fame rating after adding picture
      if (userId) {
        await this.updateCompleteness(userId);
        await this.updateFameRating(userId);
      }

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async deletePicture(profileId: string, pictureId: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get user ID for this profile
      const userQuery = 'SELECT user_id FROM profiles WHERE id = $1';
      const userResult = await client.query(userQuery, [profileId]);
      const userId = userResult.rows[0]?.user_id;

      // Delete the picture
      const query = 'DELETE FROM profile_pictures WHERE id = $1 AND profile_id = $2';
      await client.query(query, [pictureId, profileId]);

      // Update completeness then fame rating after deleting picture
      if (userId) {
        await this.updateCompleteness(userId);
        await this.updateFameRating(userId);
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getPicturesByProfileId(profileId: string): Promise<ProfilePicture[]> {
    const query = `
      SELECT id, profile_id as "profileId", url, is_profile_pic as "isProfilePic", 
             position, created_at as "createdAt"
      FROM profile_pictures 
      WHERE profile_id = $1 
      ORDER BY is_profile_pic DESC, position ASC
    `;
    const result = await pool.query(query, [profileId]);
    return result.rows;
  }

  // Public profile views
  static async getPublicProfile(username: string, viewerId?: string): Promise<PublicProfile | null> {
    const client = await pool.connect();
    try {
      const profileQuery = `
        SELECT p.id, p.user_id as "userId", u.username, u.first_name as "firstName", 
               u.last_name as "lastName", p.gender, p.sexual_preference as "sexualPreference",
               p.bio, p.date_of_birth as "dateOfBirth",
               p.fame_rating as "fameRating", p.neighborhood, p.completeness, 
               p.created_at as "createdAt", u.is_online as "isOnline", u.last_seen as "lastSeen"
        FROM profiles p
        JOIN users u ON p.user_id = u.id
        WHERE u.username = $1 AND u.is_verified = true
      `;
      const profileResult = await client.query(profileQuery, [username]);
      
      if (profileResult.rows.length === 0) {
        return null;
      }
      
      const profile = profileResult.rows[0];

      // Get interests, pictures, and interaction status
      const queries = [
        client.query(`
          SELECT i.id, i.name
          FROM interests i
          JOIN profile_interests pi ON i.id = pi.interest_id
          WHERE pi.profile_id = $1
        `, [profile.id]),
        client.query(`
          SELECT id, profile_id as "profileId", url, is_profile_pic as "isProfilePic", 
                 position, created_at as "createdAt"
          FROM profile_pictures 
          WHERE profile_id = $1 
          ORDER BY is_profile_pic DESC, position ASC
        `, [profile.id])
      ];

      // If viewer is provided, check interaction status
      if (viewerId) {
        // Check if viewer has liked this profile
        queries.push(
          client.query(`
            SELECT id FROM likes 
            WHERE from_user = $1 AND to_user = $2
          `, [viewerId, profile.userId])
        );
        
        // Check if this profile has liked the viewer
        queries.push(
          client.query(`
            SELECT id FROM likes 
            WHERE from_user = $1 AND to_user = $2
          `, [profile.userId, viewerId])
        );
        
        // Check if viewer has blocked this profile
        queries.push(
          client.query(`
            SELECT id FROM blocks 
            WHERE blocker_id = $1 AND blocked_id = $2
          `, [viewerId, profile.userId])
        );
      }

      const results = await Promise.all(queries);
      
      const [interestsResult, picturesResult, ...statusResults] = results;

      let isLiked = false;
      let hasLikedMe = false;
      let isBlocked = false;

      if (viewerId && statusResults.length >= 3) {
        isLiked = statusResults[0].rows.length > 0;
        hasLikedMe = statusResults[1].rows.length > 0;
        isBlocked = statusResults[2].rows.length > 0;
      }

      return {
        ...profile,
        interests: interestsResult.rows,
        pictures: picturesResult.rows,
        isLiked,
        hasLikedMe,
        isConnected: isLiked && hasLikedMe,
        isBlocked
      };
    } finally {
      client.release();
    }
  }

  // Browse and matching with intelligent suggestions
  static async browseProfiles(currentUserId: string, filters: BrowseFilters): Promise<UserProfile[]> {
    const client = await pool.connect();
    try {
      // First get current user's profile for matching logic
      const currentUserProfile = await this.getProfileByUserId(currentUserId);
      if (!currentUserProfile) {
        throw new Error('Current user profile not found');
      }

      // Determine sexual orientation matching
      let genderFilter = '';
      let genderParams: string[] = [];
      
      if (currentUserProfile.sexualPreference) {
        switch (currentUserProfile.sexualPreference) {
          case 'men':
          case 'male':
            genderFilter = "AND p.gender = 'male'";
            break;
          case 'women':
          case 'female':
            genderFilter = "AND p.gender = 'female'";
            break;
          case 'both':
            // No gender filter for bisexual
            break;
          default:
            // Default to bisexual behavior if preference not specified
            break;
        }
      }
      // Default behavior: show all genders if no preference specified (bisexual)

      // Build base query with intelligent matching
      let baseQuery = `
        FROM profiles p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN (
          SELECT 
            pi.profile_id,
            COUNT(CASE WHEN current_interests.interest_id IS NOT NULL THEN 1 END) as common_interests_count
          FROM profile_interests pi
          LEFT JOIN (
            SELECT interest_id 
            FROM profile_interests 
            WHERE profile_id = $2
          ) current_interests ON pi.interest_id = current_interests.interest_id
          GROUP BY pi.profile_id
        ) interests_match ON p.id = interests_match.profile_id
        WHERE u.is_verified = true 
          AND u.is_profile_completed = true
          AND p.user_id != $1
          AND p.completeness >= 50
          AND p.user_id NOT IN (
            SELECT blocked_id FROM blocks WHERE blocker_id = $1
            UNION
            SELECT blocker_id FROM blocks WHERE blocked_id = $1
          )
          AND p.user_id NOT IN (
            SELECT to_user FROM likes WHERE from_user = $1
          )
          ${genderFilter}
      `;
      
      const values = [currentUserId, currentUserProfile.id];
      let paramCount = 3;

      // Age filters
      if (filters.minAge || filters.maxAge) {
        const today = new Date();
        if (filters.maxAge) {
          const minBirthDate = new Date(today.getFullYear() - filters.maxAge - 1, today.getMonth(), today.getDate());
          baseQuery += ` AND p.date_of_birth >= $${paramCount}`;
          values.push(minBirthDate.toISOString().split('T')[0]);
          paramCount++;
        }
        if (filters.minAge) {
          const maxBirthDate = new Date(today.getFullYear() - filters.minAge, today.getMonth(), today.getDate());
          baseQuery += ` AND p.date_of_birth <= $${paramCount}`;
          values.push(maxBirthDate.toISOString().split('T')[0]);
          paramCount++;
        }
      }

      // Fame rating filters
      if (filters.fameMin !== undefined) {
        baseQuery += ` AND p.fame_rating >= $${paramCount}`;
        values.push(filters.fameMin);
        paramCount++;
      }
      
      if (filters.fameMax !== undefined) {
        baseQuery += ` AND p.fame_rating <= $${paramCount}`;
        values.push(filters.fameMax);
        paramCount++;
      }

      // Interest filters
      if (filters.interests && filters.interests.length > 0) {
        baseQuery += ` AND p.id IN (
          SELECT DISTINCT pi.profile_id 
          FROM profile_interests pi 
          JOIN interests i ON pi.interest_id = i.id 
          WHERE i.name = ANY($${paramCount})
        )`;
        values.push(filters.interests);
        paramCount++;
      }

      // Distance calculation - always include distance field
      let distanceSelect = '';
      let distanceOrderPriority = '';
      
      if (currentUserProfile.latitude && currentUserProfile.longitude) {
        // Current user has GPS coordinates - can calculate distance to GPS users
        distanceSelect = `, 
          CASE 
            WHEN p.latitude IS NOT NULL AND p.longitude IS NOT NULL THEN
              6371 * acos(
                cos(radians($${paramCount})) * cos(radians(p.latitude)) * 
                cos(radians(p.longitude) - radians($${paramCount + 1})) + 
                sin(radians($${paramCount})) * sin(radians(p.latitude))
              )
            ELSE NULL
          END as distance`;
        
        values.push(currentUserProfile.latitude, currentUserProfile.longitude);
        paramCount += 2;

        // Apply distance filter if specified (only for GPS users)
        if (filters.location?.radiusKm) {
          baseQuery += ` AND p.latitude IS NOT NULL AND p.longitude IS NOT NULL`;
          baseQuery += ` AND 6371 * acos(
            cos(radians($${paramCount})) * cos(radians(p.latitude)) * 
            cos(radians(p.longitude) - radians($${paramCount + 1})) + 
            sin(radians($${paramCount})) * sin(radians(p.latitude))
          ) <= $${paramCount + 2}`;
          values.push(currentUserProfile.latitude, currentUserProfile.longitude, filters.location.radiusKm);
          paramCount += 3;
        }

        // Geographic priority: GPS users within 25km get priority 1, same city gets priority 2, others get priority 3
        distanceOrderPriority = `, 
          CASE 
            WHEN p.latitude IS NOT NULL AND p.longitude IS NOT NULL 
              AND 6371 * acos(
                cos(radians(${currentUserProfile.latitude})) * cos(radians(p.latitude)) * 
                cos(radians(p.longitude) - radians(${currentUserProfile.longitude})) + 
                sin(radians(${currentUserProfile.latitude})) * sin(radians(p.latitude))
              ) <= 25 
            THEN 1
            WHEN p.neighborhood IS NOT NULL AND p.neighborhood ILIKE '%${currentUserProfile.neighborhood?.split(',')[0] || ''}%'
            THEN 2
            ELSE 3
          END as geo_priority`;
      } else {
        // Current user doesn't have GPS - use city-based matching only
        distanceSelect = `, NULL as distance`;
        distanceOrderPriority = `, 
          CASE 
            WHEN p.neighborhood IS NOT NULL AND p.neighborhood ILIKE '%${currentUserProfile.neighborhood?.split(',')[0] || ''}%'
            THEN 1
            ELSE 2
          END as geo_priority`;
      }

      // Build ORDER BY clause based on sortBy parameter or intelligent default
      let orderBy = '';
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'age':
            orderBy = `ORDER BY p.date_of_birth ${filters.sortOrder === 'asc' ? 'DESC' : 'ASC'}`;
            break;
          case 'location':
            if (distanceSelect) {
              orderBy = `ORDER BY distance ${filters.sortOrder || 'ASC'}`;
            } else {
              orderBy = 'ORDER BY p.fame_rating DESC';
            }
            break;
          case 'fame_rating':
            orderBy = `ORDER BY p.fame_rating ${filters.sortOrder || 'DESC'}`;
            break;
          case 'common_tags':
            orderBy = `ORDER BY COALESCE(interests_match.common_interests_count, 0) ${filters.sortOrder || 'DESC'}, p.fame_rating DESC`;
            break;
          default:
            // Intelligent default sorting
            orderBy = distanceOrderPriority ? 
              `ORDER BY geo_priority ASC, COALESCE(interests_match.common_interests_count, 0) DESC, p.fame_rating DESC` :
              `ORDER BY COALESCE(interests_match.common_interests_count, 0) DESC, p.fame_rating DESC`;
        }
      } else {
        // Intelligent default sorting: geography > common interests > fame rating
        orderBy = distanceOrderPriority ? 
          `ORDER BY geo_priority ASC, COALESCE(interests_match.common_interests_count, 0) DESC, p.fame_rating DESC` :
          `ORDER BY COALESCE(interests_match.common_interests_count, 0) DESC, p.fame_rating DESC`;
      }

      // Build the complete query
      const query = `
        SELECT p.id, p.user_id as "userId", u.username, u.first_name as "firstName", 
               u.last_name as "lastName", p.gender, p.bio, p.date_of_birth as "dateOfBirth",
               p.fame_rating as "fameRating", p.neighborhood, p.completeness, p.created_at as "createdAt",
               COALESCE(interests_match.common_interests_count, 0) as common_interests
               ${distanceSelect}
               ${distanceOrderPriority}
        ${baseQuery}
        ${orderBy}
        LIMIT ${filters.limit || 20} OFFSET ${filters.offset || 0}
      `;

      const result = await client.query(query, values);
      
      // Get interests and pictures for each profile
      const profiles = await Promise.all(result.rows.map(async (profile) => {
        const [interests, pictures, isLiked, hasLikedBack] = await Promise.all([
          this.getInterestsByProfileId(profile.id),
          this.getPicturesByProfileId(profile.id),
          this.checkIfLiked(currentUserId, profile.userId),
          this.checkIfLiked(profile.userId, currentUserId)
        ]);

        // Calculate age from date of birth
        const age = profile.dateOfBirth ? 
          Math.floor((Date.now() - new Date(profile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 
          null;

        return {
          ...profile,
          age,
          interests,
          pictures,
          distance: profile.distance,
          commonInterests: profile.common_interests || 0,
          isLiked,
          hasLikedBack,
          isBlocked: false // Already filtered out in query
        };
      }));

      return profiles;
    } finally {
      client.release();
    }
  }

  // Search profiles - manual search without algorithm matching
  static async searchProfiles(currentUserId: string, filters: SearchFilters): Promise<UserProfile[]> {
    const client = await pool.connect();
    try {
      // First get current user's profile for distance calculation
      const currentUserProfile = await this.getProfileByUserId(currentUserId);
      
      // Build base query for manual search - all profiles without algorithm
      let baseQuery = `
        FROM profiles p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN (
          SELECT 
            pi.profile_id,
            COUNT(*) as interests_count
          FROM profile_interests pi
          GROUP BY pi.profile_id
        ) interests_count ON p.id = interests_count.profile_id
        WHERE u.is_verified = true 
          AND u.is_profile_completed = true
          AND p.user_id != $1
          AND p.completeness >= 50
          AND p.user_id NOT IN (
            SELECT blocked_id FROM blocks WHERE blocker_id = $1
            UNION
            SELECT blocker_id FROM blocks WHERE blocked_id = $1
          )
      `;
      
      const values: any[] = [currentUserId];
      let paramCount = 2;

      // Distance calculation - always include distance field for search
      let distanceSelect = '';
      
      if (currentUserProfile?.latitude && currentUserProfile?.longitude) {
        // Current user has GPS coordinates - can calculate distance to GPS users
        distanceSelect = `, 
          CASE 
            WHEN p.latitude IS NOT NULL AND p.longitude IS NOT NULL THEN
              6371 * acos(
                cos(radians($${paramCount})) * cos(radians(p.latitude)) * 
                cos(radians(p.longitude) - radians($${paramCount + 1})) + 
                sin(radians($${paramCount})) * sin(radians(p.latitude))
              )
            ELSE NULL
          END as distance`;
        
        values.push(currentUserProfile.latitude, currentUserProfile.longitude);
        paramCount += 2;
      } else {
        // Current user doesn't have GPS - no distance calculation
        distanceSelect = `, NULL as distance`;
      }

      // Age filters
      if (filters.minAge || filters.maxAge) {
        const today = new Date();
        if (filters.maxAge) {
          const minBirthDate = new Date(today.getFullYear() - filters.maxAge - 1, today.getMonth(), today.getDate());
          baseQuery += ` AND p.date_of_birth >= $${paramCount}`;
          values.push(minBirthDate.toISOString().split('T')[0]);
          paramCount++;
        }
        if (filters.minAge) {
          const maxBirthDate = new Date(today.getFullYear() - filters.minAge, today.getMonth(), today.getDate());
          baseQuery += ` AND p.date_of_birth <= $${paramCount}`;
          values.push(maxBirthDate.toISOString().split('T')[0]);
          paramCount++;
        }
      }

      // Fame rating filters
      if (filters.minFame !== undefined) {
        baseQuery += ` AND p.fame_rating >= $${paramCount}`;
        values.push(filters.minFame);
        paramCount++;
      }
      
      if (filters.maxFame !== undefined) {
        baseQuery += ` AND p.fame_rating <= $${paramCount}`;
        values.push(filters.maxFame);
        paramCount++;
      }

      // Interest/tags filters
      if (filters.tags && filters.tags.length > 0) {
        baseQuery += ` AND p.id IN (
          SELECT DISTINCT pi.profile_id 
          FROM profile_interests pi 
          JOIN interests i ON pi.interest_id = i.id 
          WHERE i.name = ANY($${paramCount})
        )`;
        // Convert tags to lowercase to match database storage
        values.push(filters.tags.map(tag => tag.toLowerCase().trim()));
        paramCount++;
      }

      // City/location filter
      if (filters.city) {
        baseQuery += ` AND p.neighborhood ILIKE $${paramCount}`;
        values.push(`%${filters.city}%`);
        paramCount++;
      }

      // Build ORDER BY clause based on sortBy parameter
      let orderBy = '';
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'age':
            orderBy = `ORDER BY p.date_of_birth ${filters.sortOrder === 'asc' ? 'DESC' : 'ASC'}`;
            break;
          case 'location':
            orderBy = `ORDER BY p.neighborhood ${filters.sortOrder || 'ASC'}`;
            break;
          case 'fame':
            orderBy = `ORDER BY p.fame_rating ${filters.sortOrder || 'DESC'}`;
            break;
          case 'tags':
            orderBy = `ORDER BY COALESCE(interests_count.interests_count, 0) ${filters.sortOrder || 'DESC'}, p.fame_rating DESC`;
            break;
          default:
            orderBy = 'ORDER BY p.fame_rating DESC';
        }
      } else {
        orderBy = 'ORDER BY p.fame_rating DESC';
      }

      // Build the complete query
      const query = `
        SELECT p.id, p.user_id as "userId", u.username, u.first_name as "firstName", 
               u.last_name as "lastName", p.gender, p.bio, p.date_of_birth as "dateOfBirth",
               p.fame_rating as "fameRating", p.neighborhood, p.completeness, p.created_at as "createdAt",
               COALESCE(interests_count.interests_count, 0) as tag_count
               ${distanceSelect}
        ${baseQuery}
        ${orderBy}
        LIMIT ${filters.limit || 20} OFFSET ${filters.offset || 0}
      `;

      const result = await client.query(query, values);
      
      // Get interests and pictures for each profile
      const profiles = await Promise.all(result.rows.map(async (profile: any) => {
        const [interests, pictures, isLiked, hasLikedBack] = await Promise.all([
          this.getInterestsByProfileId(profile.id),
          this.getPicturesByProfileId(profile.id),
          this.checkIfLiked(currentUserId, profile.userId),
          this.checkIfLiked(profile.userId, currentUserId)
        ]);

        // Calculate age from date of birth
        const age = profile.dateOfBirth ? 
          Math.floor((Date.now() - new Date(profile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 
          null;

        return {
          ...profile,
          age,
          interests,
          pictures,
          distance: profile.distance || null,
          commonInterests: profile.tag_count || 0,
          isLiked,
          hasLikedBack,
          isBlocked: false // Already filtered out in query
        };
      }));

      return profiles;
    } finally {
      client.release();
    }
  }

  // Helper method to check if user has liked another user
  static async checkIfLiked(fromUserId: string, toUserId: string): Promise<boolean> {
    const query = 'SELECT id FROM likes WHERE from_user = $1 AND to_user = $2';
    const result = await pool.query(query, [fromUserId, toUserId]);
    return result.rows.length > 0;
  }

  // Social features
  static async recordProfileView(
    viewerId: string, 
    viewedUserId: string, 
    viewerIp?: string, 
    viewerAgent?: string
  ): Promise<void> {
    // Don't record self-views
    if (viewerId === viewedUserId) return;

    // Check for recent view by same viewer to avoid duplicates within 10 minutes
    const recentViewQuery = `
      SELECT created_at 
      FROM profile_views 
      WHERE viewer_id = $1 AND viewed_user = $2 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    const recentView = await pool.query(recentViewQuery, [viewerId, viewedUserId]);
    
    if (recentView.rows.length > 0) {
      const lastViewTime = new Date(recentView.rows[0].created_at);
      const currentTime = new Date();
      const timeDiffMs = currentTime.getTime() - lastViewTime.getTime();
      const tenMinutesMs = 10 * 60 * 1000; // 10 minutes in milliseconds
      
      // Skip recording if last view was within 10 minutes
      if (timeDiffMs < tenMinutesMs) {
        return;
      }
    }

    const query = `
      INSERT INTO profile_views (viewer_id, viewed_user, viewer_ip, viewer_agent)
      VALUES ($1, $2, $3, $4)
    `;
    await pool.query(query, [viewerId, viewedUserId, viewerIp, viewerAgent]);
  }

  static async getProfileViews(
    userId: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<{ views: ProfileView[]; total: number; hasMore: boolean }> {
    const offset = (page - 1) * limit;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM profile_views pv
      WHERE pv.viewed_user = $1
    `;
    const countResult = await pool.query(countQuery, [userId]);
    const total = parseInt(countResult.rows[0]?.total || '0');

    // Get views with viewer details
    const query = `
      SELECT DISTINCT ON (pv.id)
        pv.id,
        pv.viewer_id as "viewerId",
        pv.viewed_user as "viewedUser",
        pv.viewer_ip as "viewerIp",
        pv.viewer_agent as "viewerAgent",
        pv.created_at as "createdAt",
        u.username,
        u.first_name as "firstName",
        u.last_name as "lastName",
        (SELECT url FROM profile_pictures WHERE profile_id = p.id AND is_profile_pic = true LIMIT 1) as "profilePicture"
      FROM profile_views pv
      LEFT JOIN users u ON pv.viewer_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE pv.viewed_user = $1
      ORDER BY pv.id, pv.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [userId, limit, offset]);
    
    const views: ProfileView[] = result.rows.map(row => ({
      id: row.id,
      viewerId: row.viewerId,
      viewedUser: row.viewedUser,
      viewerIp: row.viewerIp,
      viewerAgent: row.viewerAgent,
      createdAt: row.createdAt,
      viewer: row.viewerId ? {
        username: row.username,
        firstName: row.firstName,
        lastName: row.lastName,
        profilePicture: row.profilePicture
      } : undefined
    }));

    const hasMore = offset + limit < total;

    return { views, total, hasMore };
  }

  static async getLikesReceived(userId: string): Promise<Like[]> {
    const query = `
      SELECT 
        l.id,
        l.from_user as "fromUser",
        l.to_user as "toUser",
        l.created_at as "createdAt",
        u.username,
        u.first_name as "firstName", 
        u.last_name as "lastName",
        pp.url as "profilePicture"
      FROM likes l
      JOIN users u ON l.from_user = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN profile_pictures pp ON p.id = pp.profile_id AND pp.is_profile_pic = true
      WHERE l.to_user = $1
      ORDER BY l.created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async likeUser(fromUserId: string, toUserId: string): Promise<{ like: Like; connection?: Connection }> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create like
      const likeQuery = `
        INSERT INTO likes (from_user, to_user)
        VALUES ($1, $2)
        ON CONFLICT (from_user, to_user) DO UPDATE SET created_at = CURRENT_TIMESTAMP
        RETURNING id, from_user as "fromUser", to_user as "toUser", created_at as "createdAt"
      `;
      const likeResult = await client.query(likeQuery, [fromUserId, toUserId]);
      const like = likeResult.rows[0];

      // Check for mutual like
      const mutualLikeQuery = 'SELECT id FROM likes WHERE from_user = $1 AND to_user = $2';
      const mutualLikeResult = await client.query(mutualLikeQuery, [toUserId, fromUserId]);

      let connection;
      if (mutualLikeResult.rows.length > 0) {
        // Create connection
        const userOne = fromUserId < toUserId ? fromUserId : toUserId;
        const userTwo = fromUserId < toUserId ? toUserId : fromUserId;
        
        const connectionQuery = `
          INSERT INTO connections (user_one, user_two)
          VALUES ($1, $2)
          ON CONFLICT (user_one, user_two) DO UPDATE SET created_at = CURRENT_TIMESTAMP
          RETURNING id, user_one as "userOne", user_two as "userTwo", created_at as "createdAt"
        `;
        const connectionResult = await client.query(connectionQuery, [userOne, userTwo]);
        connection = connectionResult.rows[0];
      }

      await client.query('COMMIT');
      return { like, connection };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async unlikeUser(fromUserId: string, toUserId: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Remove like
      await client.query('DELETE FROM likes WHERE from_user = $1 AND to_user = $2', [fromUserId, toUserId]);

      // Remove connection if it exists
      const userOne = fromUserId < toUserId ? fromUserId : toUserId;
      const userTwo = fromUserId < toUserId ? toUserId : fromUserId;
      await client.query('DELETE FROM connections WHERE user_one = $1 AND user_two = $2', [userOne, userTwo]);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async blockUser(blockerId: string, blockedId: string): Promise<Block> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Remove any existing likes and connections
      await client.query('DELETE FROM likes WHERE (from_user = $1 AND to_user = $2) OR (from_user = $2 AND to_user = $1)', [blockerId, blockedId]);
      
      const userOne = blockerId < blockedId ? blockerId : blockedId;
      const userTwo = blockerId < blockedId ? blockedId : blockerId;
      await client.query('DELETE FROM connections WHERE user_one = $1 AND user_two = $2', [userOne, userTwo]);

      // Create block
      const blockQuery = `
        INSERT INTO blocks (blocker_id, blocked_id)
        VALUES ($1, $2)
        ON CONFLICT (blocker_id, blocked_id) DO UPDATE SET created_at = CURRENT_TIMESTAMP
        RETURNING id, blocker_id as "blockerId", blocked_id as "blockedId", created_at as "createdAt"
      `;
      const result = await client.query(blockQuery, [blockerId, blockedId]);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async reportUser(reporterId: string, reportedId: string, reason?: string): Promise<Report> {
    const query = `
      INSERT INTO reports (reporter_id, reported_id, reason)
      VALUES ($1, $2, $3)
      RETURNING id, reporter_id as "reporterId", reported_id as "reportedId", reason, created_at as "createdAt"
    `;
    const result = await pool.query(query, [reporterId, reportedId, reason]);
    return result.rows[0];
  }

  // Fame rating calculation
  // Formula (0-100 scale):
  //   completeness_score : completeness * 0.4           → max 40 pts (full profile)
  //   likes_score        : LEAST(40, 10*ln(1+likes))    → max 40 pts (logarithmic, ~54 likes for max)
  //   views_score        : LEAST(20, views_30d / 5.0)   → max 20 pts (100 views for max)
  static async updateFameRating(userId: string): Promise<number> {
    const query = `
      WITH fame_stats AS (
        SELECT 
          p.user_id,
          COALESCE(COUNT(DISTINCT l.id), 0) as likes_received,
          COALESCE(COUNT(DISTINCT pv.id) FILTER (WHERE pv.created_at > CURRENT_TIMESTAMP - INTERVAL '30 days'), 0) as views_last_30_days,
          p.completeness
        FROM profiles p
        LEFT JOIN likes l ON p.user_id = l.to_user
        LEFT JOIN profile_views pv ON p.user_id = pv.viewed_user
        WHERE p.user_id = $1
        GROUP BY p.user_id, p.completeness
      )
      UPDATE profiles 
      SET fame_rating = LEAST(100, FLOOR(
        (fame_stats.completeness * 0.4) +
        LEAST(40, 10 * ln(1 + fame_stats.likes_received)) +
        LEAST(20, fame_stats.views_last_30_days / 5.0)
      )),
      updated_at = CURRENT_TIMESTAMP
      FROM fame_stats 
      WHERE profiles.user_id = fame_stats.user_id
      RETURNING fame_rating as "fameRating"
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0]?.fameRating || 0;
  }

  // Recalculate and update profile completeness
  static async updateCompleteness(userId: string): Promise<number> {
    const completeness = await this.calculateCompletenessForUser(userId, {});
    
    const query = `
      UPDATE profiles 
      SET completeness = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE user_id = $2
      RETURNING completeness
    `;
    
    const result = await pool.query(query, [completeness, userId]);
    return result.rows[0]?.completeness || 0;
  }

  // Helper methods
  private static calculateCompleteness(profileData: CreateProfileInput): number {
    let score = 0;
    
    // Basic profile fields (70 points total) - same as calculateCompletenessForUser
    if (profileData.gender) score += 10;
    if (profileData.sexualPreference) score += 10;
    if (profileData.bio && profileData.bio.length > 20) score += 20;
    if (profileData.dateOfBirth) score += 10;
    if ((profileData.latitude && profileData.longitude) || profileData.neighborhood) score += 20;
    
    // Note: Pictures and interests start at 0 for new profiles
    // They will be calculated when added via addPicture() and addInterestsToProfile()
    return score;
  }

  private static async calculateCompletenessForUser(userId: string, updates: UpdateProfileInput): Promise<number> {
    const client = await pool.connect();
    try {
      // Get current profile data
      const current = await this.getProfileByUserId(userId);
      if (!current) return 0;

      // Merge current data with updates
      const merged = { ...current, ...updates };
      
      // Calculate base score from profile fields (70 points)
      let score = 0;
      if (merged.gender) score += 10;
      if (merged.sexualPreference) score += 10;
      if (merged.bio && merged.bio.length > 20) score += 20;
      if (merged.dateOfBirth) score += 10;
      if ((merged.latitude && merged.longitude) || merged.neighborhood) score += 20;

      // Add points for pictures (20 points total)
      const picturesQuery = `
        SELECT COUNT(*) as count 
        FROM profile_pictures 
        WHERE profile_id = $1
      `;
      const picturesResult = await client.query(picturesQuery, [current.id]);
      const pictureCount = parseInt(picturesResult.rows[0].count);
      
      if (pictureCount >= 1) score += 5;   // First picture
      if (pictureCount >= 2) score += 5;   // Second picture  
      if (pictureCount >= 3) score += 5;   // Third picture
      if (pictureCount >= 4) score += 5;   // Fourth+ picture (max 20 points)

      // Add points for interests (10 points total)
      const interestsQuery = `
        SELECT COUNT(*) as count 
        FROM profile_interests pi
        WHERE pi.profile_id = $1
      `;
      const interestsResult = await client.query(interestsQuery, [current.id]);
      const interestCount = parseInt(interestsResult.rows[0].count);
      
      // Interest scoring - tier-based, not cumulative
      if (interestCount >= 5) {
        score += 10;   // 5+ interests = 10 points
      } else if (interestCount >= 3) {
        score += 7;    // 3-4 interests = 7 points  
      } else if (interestCount >= 1) {
        score += 3;    // 1-2 interests = 3 points
      }
      // 0 interests = 0 points

      // Cap at 100%
      return Math.min(score, 100);
      
    } finally {
      client.release();
    }
  }

  private static async getInterestsByProfileId(profileId: string): Promise<Interest[]> {
    const query = `
      SELECT i.id, i.name
      FROM interests i
      JOIN profile_interests pi ON i.id = pi.interest_id
      WHERE pi.profile_id = $1
    `;
    const result = await pool.query(query, [profileId]);
    return result.rows;
  }

  // Get blocked users for a user
  static async getBlockedUsers(userId: string): Promise<Array<{
    id: string;
    userId: string;
    username: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    blockedAt: Date;
  }>> {
    const query = `
      SELECT 
        u.id,
        u.username,
        u.first_name as "firstName",
        u.last_name as "lastName",
        pp.url as "profilePicture",
        b.created_at as "blockedAt"
      FROM blocks b
      JOIN users u ON b.blocked_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN profile_pictures pp ON p.id = pp.profile_id AND pp.is_profile_pic = true
      WHERE b.blocker_id = $1
      ORDER BY b.created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows.map(row => ({
      id: row.id,
      userId: row.id,
      username: row.username,
      firstName: row.firstName,
      lastName: row.lastName,
      profilePicture: row.profilePicture,
      blockedAt: row.blockedAt
    }));
  }

  // Unblock a user
  static async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    const query = `
      DELETE FROM blocks 
      WHERE blocker_id = $1 AND blocked_id = $2
    `;
    
    const result = await pool.query(query, [blockerId, blockedId]);
    
    if (result.rowCount === 0) {
      throw new Error('No block found to remove');
    }
  }

  // Check if user is blocked
  static async isUserBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const query = `
      SELECT 1 FROM blocks 
      WHERE blocker_id = $1 AND blocked_id = $2
    `;
    
    const result = await pool.query(query, [blockerId, blockedId]);
    return result.rows.length > 0;
  }
}
