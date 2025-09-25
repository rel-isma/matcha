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
    const query = `
      INSERT INTO profiles (user_id, gender, sexual_preference, bio, latitude, longitude, 
                           location_source, neighborhood, completeness)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, user_id as "userId", gender, sexual_preference as "sexualPreference", 
                bio, fame_rating as "fameRating", latitude, longitude, 
                location_source as "locationSource", neighborhood, completeness,
                created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const completeness = this.calculateCompleteness(profileData);
    const values = [
      userId,
      profileData.gender,
      profileData.sexualPreference,
      profileData.bio,
      profileData.latitude,
      profileData.longitude,
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
               bio, fame_rating as "fameRating", latitude, longitude, 
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
                bio, fame_rating as "fameRating", latitude, longitude, 
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

      for (const name of interestNames) {
        const interest = await this.getOrCreateInterest(name);
        await client.query(
          'INSERT INTO profile_interests (profile_id, interest_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [profileId, interest.id]
        );
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
    const query = 'DELETE FROM profile_interests WHERE profile_id = $1 AND interest_id = $2';
    await pool.query(query, [profileId, interestId]);
  }

  // Picture management
  static async addPicture(profileId: string, url: string, isProfilePic = false): Promise<ProfilePicture> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

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
    const query = 'DELETE FROM profile_pictures WHERE id = $1 AND profile_id = $2';
    await pool.query(query, [pictureId, profileId]);
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
  static async getPublicProfile(username: string): Promise<PublicProfile | null> {
    const client = await pool.connect();
    try {
      const profileQuery = `
        SELECT p.id, p.user_id as "userId", u.username, u.first_name as "firstName", 
               u.last_name as "lastName", p.gender, p.bio, p.fame_rating as "fameRating", 
               p.neighborhood, p.completeness, p.created_at as "createdAt"
        FROM profiles p
        JOIN users u ON p.user_id = u.id
        WHERE u.username = $1 AND u.is_verified = true
      `;
      const profileResult = await client.query(profileQuery, [username]);
      
      if (profileResult.rows.length === 0) {
        return null;
      }
      
      const profile = profileResult.rows[0];

      // Get interests and pictures
      const [interestsResult, picturesResult] = await Promise.all([
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
      ]);

      return {
        ...profile,
        interests: interestsResult.rows,
        pictures: picturesResult.rows
      };
    } finally {
      client.release();
    }
  }

  // Browse and matching
  static async browseProfiles(currentUserId: string, filters: BrowseFilters): Promise<UserProfile[]> {
    const client = await pool.connect();
    try {
      let baseQuery = `
        FROM profiles p
        JOIN users u ON p.user_id = u.id
        WHERE u.is_verified = true 
          AND p.user_id != $1
          AND p.user_id NOT IN (
            SELECT blocked_id FROM blocks WHERE blocker_id = $1
            UNION
            SELECT blocker_id FROM blocks WHERE blocked_id = $1
          )
      `;
      
      const values = [currentUserId];
      let paramCount = 2;

      // Add filters
      if (filters.gender) {
        baseQuery += ` AND p.gender = $${paramCount}`;
        values.push(filters.gender);
        paramCount++;
      }

      if (filters.fameRating) {
        baseQuery += ` AND p.fame_rating >= $${paramCount}`;
        values.push(filters.fameRating);
        paramCount++;
      }

      // Location filter (Haversine formula for distance)
      let distanceSelect = '';
      if (filters.location) {
        distanceSelect = `, 
          6371 * acos(
            cos(radians($${paramCount})) * cos(radians(p.latitude)) * 
            cos(radians(p.longitude) - radians($${paramCount + 1})) + 
            sin(radians($${paramCount})) * sin(radians(p.latitude))
          ) as distance`;
        
        baseQuery += ` AND p.latitude IS NOT NULL AND p.longitude IS NOT NULL`;
        values.push(filters.location.latitude, filters.location.longitude);
        paramCount += 2;

        baseQuery += ` AND 6371 * acos(
          cos(radians($${paramCount})) * cos(radians(p.latitude)) * 
          cos(radians(p.longitude) - radians($${paramCount + 1})) + 
          sin(radians($${paramCount})) * sin(radians(p.latitude))
        ) <= $${paramCount + 2}`;
        values.push(filters.location.latitude, filters.location.longitude, filters.location.radiusKm);
        paramCount += 3;
      }

      // Build the full query
      let orderBy = 'ORDER BY p.fame_rating DESC';
      if (filters.sortBy === 'distance' && filters.location) {
        orderBy = 'ORDER BY distance ASC';
      }

      const query = `
        SELECT p.id, p.user_id as "userId", u.username, u.first_name as "firstName", 
               u.last_name as "lastName", p.gender, p.bio, p.fame_rating as "fameRating", 
               p.neighborhood, p.completeness, p.created_at as "createdAt"
               ${distanceSelect}
        ${baseQuery}
        ${orderBy}
        LIMIT ${filters.limit || 20} OFFSET ${filters.offset || 0}
      `;

      const result = await client.query(query, values);
      
      // Get interests and pictures for each profile
      const profiles = await Promise.all(result.rows.map(async (profile) => {
        const [interests, pictures] = await Promise.all([
          this.getInterestsByProfileId(profile.id),
          this.getPicturesByProfileId(profile.id)
        ]);

        return {
          ...profile,
          interests,
          pictures,
          distance: profile.distance || undefined
        };
      }));

      return profiles;
    } finally {
      client.release();
    }
  }

  // Social features
  static async recordProfileView(viewerId: string, viewedUserId: string): Promise<void> {
    const query = `
      INSERT INTO profile_views (viewer_id, viewed_user)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `;
    await pool.query(query, [viewerId, viewedUserId]);
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
      SET fame_rating = FLOOR(
        2 * ln(1 + fame_stats.likes_received) + 
        0.5 * (fame_stats.views_last_30_days / 10.0) + 
        fame_stats.completeness
      ),
      updated_at = CURRENT_TIMESTAMP
      FROM fame_stats 
      WHERE profiles.user_id = fame_stats.user_id
      RETURNING fame_rating as "fameRating"
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0]?.fameRating || 0;
  }

  // Helper methods
  private static calculateCompleteness(profileData: CreateProfileInput): number {
    let score = 0;
    if (profileData.gender) score += 20;
    if (profileData.sexualPreference) score += 20;
    if (profileData.bio && profileData.bio.length > 20) score += 30;
    if (profileData.latitude && profileData.longitude) score += 30;
    return score;
  }

  private static async calculateCompletenessForUser(userId: string, updates: UpdateProfileInput): Promise<number> {
    const current = await this.getProfileByUserId(userId);
    if (!current) return 0;

    const merged = { ...current, ...updates };
    return this.calculateCompleteness(merged);
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
}
