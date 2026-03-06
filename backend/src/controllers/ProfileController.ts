import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { cleanClientIp, ipapiLookup } from '../utils/ip';
import { ProfileModel } from '../models/Profile';
import { UserModel } from '../models/User';
import { MessageModel } from '../models/Message';
import { NotificationService } from '../services/NotificationService';
import { ApiResponse, CreateProfileInput, UpdateProfileInput, BrowseFilters, SearchFilters } from '../types';
import { reverseGeocode, isCoordinateFormat, extractCoordinatesFromString } from '../utils/geocoding';

/**
 * @swagger
 * components:
 *   schemas:
 *     Profile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         user_id:
 *           type: string
 *           format: uuid
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         biography:
 *           type: string
 *         age:
 *           type: integer
 *         gender:
 *           type: string
 *           enum: [male, female, non-binary, other]
 *         sexual_preference:
 *           type: string
 *           enum: [men, women, both]
 *         location:
 *           type: string
 *         latitude:
 *           type: number
 *         longitude:
 *           type: number
 *         fame_rating:
 *           type: number
 *         is_online:
 *           type: boolean
 *         last_seen:
 *           type: string
 *           format: date-time
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         interests:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Interest'
 *         pictures:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProfilePicture'
 *     
 *     Interest:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *     
 *     ProfilePicture:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         filename:
 *           type: string
 *         original_name:
 *           type: string
 *         file_path:
 *           type: string
 *         file_size:
 *           type: integer
 *         mime_type:
 *           type: string
 *         is_primary:
 *           type: boolean
 *         created_at:
 *           type: string
 *           format: date-time
 *     
 *     UpdateProfileInput:
 *       type: object
 *       properties:
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         biography:
 *           type: string
 *         age:
 *           type: integer
 *           minimum: 18
 *           maximum: 100
 *         gender:
 *           type: string
 *           enum: [male, female, non-binary, other]
 *         sexual_preference:
 *           type: string
 *           enum: [men, women, both]
 *         location:
 *           type: string
 *         latitude:
 *           type: number
 *         longitude:
 *           type: number
 *     
 *     BrowseFilters:
 *       type: object
 *       properties:
 *         age_min:
 *           type: integer
 *           minimum: 18
 *         age_max:
 *           type: integer
 *           maximum: 100
 *         max_distance:
 *           type: number
 *         fame_min:
 *           type: number
 *         fame_max:
 *           type: number
 *         interests:
 *           type: array
 *           items:
 *             type: string
 *         sort_by:
 *           type: string
 *           enum: [age, distance, fame_rating, common_interests]
 *         sort_order:
 *           type: string
 *           enum: [asc, desc]
 *         page:
 *           type: integer
 *           minimum: 1
 *         limit:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *     
 *     ReportInput:
 *       type: object
 *       required:
 *         - reason
 *       properties:
 *         reason:
 *           type: string
 *           enum: [fake_profile, inappropriate_content, harassment, spam, other]
 *         description:
 *           type: string
 */

export class ProfileController {
  /**
   * @swagger
   * /profile/me:
   *   get:
   *     summary: Get current user's profile
   *     tags: [Profile]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Profile retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 data:
   *                   $ref: '#/components/schemas/Profile'
   *       404:
   *         description: Profile not found
   *       401:
   *         description: Unauthorized
   */
  // Get current user's profile
  static async getMyProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const profile = await ProfileModel.getProfileByUserId(userId);
      
      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Profile not found'
        });
      }

      // Check if user doesn't have GPS location and set IP location
      if (!profile.latitude || !profile.longitude || profile.locationSource !== 'gps') {
        try {
          const clientIp = cleanClientIp(req);
          
          if (clientIp) {
            const locationData = await ipapiLookup(clientIp);
            
            // Update profile with IP-based location
            await ProfileModel.updateProfile(userId, {
              latitude: locationData.latitude,
              longitude: locationData.longitude,
              locationSource: 'ip',
              neighborhood: locationData.city ? locationData.city : 
                (profile.neighborhood || '')
            });

            // Get updated profile
            const updatedProfile = await ProfileModel.getProfileByUserId(userId);
            
            return res.json({
              success: true,
              message: 'Profile retrieved successfully (location updated)',
              data: updatedProfile
            });
          }
        } catch (locationError) {
          // Don't fail the request if location update fails
          console.error('Failed to update location from IP:', locationError);
        }
      }

      return res.json({
        success: true,
        message: 'Profile retrieved successfully',
        data: profile
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * @swagger
   * /profile/me:
   *   put:
   *     summary: Update current user's profile
   *     tags: [Profile]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateProfileInput'
   *     responses:
   *       200:
   *         description: Profile updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 data:
   *                   $ref: '#/components/schemas/Profile'
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   */
  // Create or update current user's profile
  static async updateMyProfile(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const profileData: UpdateProfileInput = req.body;
      
      // Check if profile exists
      const existingProfile = await ProfileModel.getProfileByUserId(userId);
      
      let profile;
      if (existingProfile) {
        profile = await ProfileModel.updateProfile(userId, profileData);
      } else {
        profile = await ProfileModel.createProfile(userId, profileData as CreateProfileInput);
      }

      // Update fame rating
      await ProfileModel.updateFameRating(userId);

      // Check and update profile completion status
      await ProfileController.checkAndUpdateProfileCompletion(userId);

      return res.json({
        success: true,
        message: existingProfile ? 'Profile updated successfully' : 'Profile created successfully',
        data: profile
      });
    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * @swagger
   * /profile/location:
   *   post:
   *     summary: Update user location
   *     tags: [Profile]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               city:
   *                 type: string
   *                 description: City name (optional for GPS source)
   *               lat:
   *                 type: number
   *                 description: Latitude coordinate
   *               lon:
   *                 type: number
   *                 description: Longitude coordinate
   *               source:
   *                 type: string
   *                 enum: [gps, manual, default, ip]
   *                 description: Location source
   *             required:
   *               - lat
   *               - lon
   *               - source
   *     responses:
   *       200:
   *         description: Location updated successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Profile not found
   */
  // Update user location
  static async updateLocation(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const { city, lat, lon, source } = req.body;

      // Validate required fields
      if (typeof lat !== 'number' || typeof lon !== 'number' || !source) {
        return res.status(400).json({
          success: false,
          message: 'Invalid location data. lat, lon, and source are required.'
        });
      }

      // Validate source
      if (!['gps', 'manual', 'default', 'ip'].includes(source)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid source. Must be one of: gps, manual, default, ip'
        });
      }

      // Check if profile exists
      const existingProfile = await ProfileModel.getProfileByUserId(userId);
      
      if (!existingProfile) {
        return res.status(404).json({
          success: false,
          message: 'Profile not found. Please create a profile first.'
        });
      }

      // Update location data
      const locationData: UpdateProfileInput = {
        latitude: lat,
        longitude: lon,
        locationSource: source,
        neighborhood: city || existingProfile.neighborhood
      };

      const profile = await ProfileModel.updateProfile(userId, locationData);

      // Update fame rating
      await ProfileModel.updateFameRating(userId);

      return res.json({
        success: true,
        message: 'Location updated successfully',
        data: {
          latitude: profile.latitude,
          longitude: profile.longitude,
          locationSource: profile.locationSource,
          neighborhood: profile.neighborhood
        }
      });
    } catch (error) {
      console.error('Update location error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * @swagger
   * /profile/me/pictures:
   *   post:
   *     summary: Upload profile picture
   *     tags: [Profile Pictures]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               picture:
   *                 type: string
   *                 format: binary
   *     responses:
   *       201:
   *         description: Picture uploaded successfully
   *       400:
   *         description: Invalid file or validation error
   *       401:
   *         description: Unauthorized
   */
  // Upload profile picture
  static async uploadPicture(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      if (!req.processedImage) {
        return res.status(400).json({
          success: false,
          message: 'No image provided'
        });
      }

      const profile = await ProfileModel.getProfileByUserId(userId);
      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Profile not found. Please create a profile first.'
        });
      }

      // Check current picture count
      const currentPictures = await ProfileModel.getPicturesByProfileId(profile.id);
      if (currentPictures.length >= 5) {
        return res.status(400).json({
          success: false,
          message: 'Maximum of 5 pictures allowed'
        });
      }

      const isProfilePic = req.body.isProfilePic === 'true' || currentPictures.length === 0;
      
      const picture = await ProfileModel.addPicture(
        profile.id,
        req.processedImage.url,
        isProfilePic
      );

      // Check and update profile completion status
      await ProfileController.checkAndUpdateProfileCompletion(userId);

      return res.json({
        success: true,
        message: 'Picture uploaded successfully',
        data: picture
      });
    } catch (error) {
      console.error('Upload picture error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Delete profile picture
  static async deletePicture(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { pictureId } = req.params;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const profile = await ProfileModel.getProfileByUserId(userId);
      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Profile not found'
        });
      }

      await ProfileModel.deletePicture(profile.id, pictureId);

      return res.json({
        success: true,
        message: 'Picture deleted successfully'
      });
    } catch (error) {
      console.error('Delete picture error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Add interests to profile
  static async addInterests(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const userId = req.user?.userId;
      const { interests } = req.body;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const profile = await ProfileModel.getProfileByUserId(userId);
      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Profile not found'
        });
      }

      await ProfileModel.addInterestsToProfile(profile.id, interests);

      // Check and update profile completion status
      await ProfileController.checkAndUpdateProfileCompletion(userId);

      const updatedProfile = await ProfileModel.getProfileByUserId(userId);

      return res.json({
        success: true,
        message: 'Interests added successfully'
      });
    } catch (error) {
      console.error('Add interests error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Remove interest from profile
  static async removeInterest(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { interestId } = req.params;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const profile = await ProfileModel.getProfileByUserId(userId);
      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Profile not found'
        });
      }

      await ProfileModel.removeInterestFromProfile(profile.id, parseInt(interestId));

      return res.json({
        success: true,
        message: 'Interest removed successfully'
      });
    } catch (error) {
      console.error('Remove interest error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get public profile by username
  static async getPublicProfile(req: Request, res: Response) {
    try {
      const { username } = req.params;
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const profile = await ProfileModel.getPublicProfile(username, userId);
      
      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Profile not found'
        });
      }

      // Don't allow viewing own profile through this endpoint
      if (profile.userId === userId) {
        return res.status(400).json({
          success: false,
          message: 'Use /api/profile/me to view your own profile'
        });
      }

      // Check if the user is blocked by the profile owner or vice versa
      const isUserBlocked = await ProfileModel.isUserBlocked(profile.userId, userId);
      const hasUserBlocked = await ProfileModel.isUserBlocked(userId, profile.userId);
      
      if (isUserBlocked || hasUserBlocked) {
        return res.status(403).json({
          success: false,
          message: 'This profile has been blocked and is no longer accessible.'
        });
      }

      // Record profile view with IP and user agent
      const clientIp = req.headers['x-forwarded-for'] as string || 
                      req.headers['x-real-ip'] as string || 
                      req.connection?.remoteAddress || 
                      req.socket?.remoteAddress || 
                      'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      
      await ProfileModel.recordProfileView(userId, profile.userId, clientIp, userAgent);

      // Send profile view notification ONLY if this is a new view (not within 10 minutes)
      // Check if we should send notification (same logic as recordProfileView)
      const shouldNotify = await ProfileController.shouldSendViewNotification(userId, profile.userId);
      
      if (shouldNotify) {
        const viewer = await UserModel.findById(userId);
        if (viewer) {
          await NotificationService.notifyProfileView(
            profile.userId,
            userId,
            viewer.username
          );
        }
      }

      return res.json({
        success: true,
        message: 'Profile retrieved successfully',
        data: { profile }
      });
    } catch (error) {
      console.error('Get public profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * @swagger
   * /profile/browse:
   *   get:
   *     summary: Browse profiles with filters
   *     tags: [Profile]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: age_min
   *         schema:
   *           type: integer
   *           minimum: 18
   *         description: Minimum age filter
   *       - in: query
   *         name: age_max
   *         schema:
   *           type: integer
   *           maximum: 100
   *         description: Maximum age filter
   *       - in: query
   *         name: max_distance
   *         schema:
   *           type: number
   *         description: Maximum distance in kilometers
   *       - in: query
   *         name: fame_min
   *         schema:
   *           type: number
   *         description: Minimum fame rating
   *       - in: query
   *         name: fame_max
   *         schema:
   *           type: number
   *         description: Maximum fame rating
   *       - in: query
   *         name: interests
   *         schema:
   *           type: array
   *           items:
   *             type: string
   *         description: Array of interest names
   *       - in: query
   *         name: sort_by
   *         schema:
   *           type: string
   *           enum: [age, distance, fame_rating, common_interests]
   *         description: Sort field
   *       - in: query
   *         name: sort_order
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *         description: Sort order
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 50
   *         description: Results per page
   *     responses:
   *       200:
   *         description: Profiles retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Profile'
   *       401:
   *         description: Unauthorized
   */
  // Browse profiles with filters
  static async browseProfiles(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      // Parse query parameters into filters
      const filters: BrowseFilters = {
        minAge: req.query.minAge ? parseInt(req.query.minAge as string) : undefined,
        maxAge: req.query.maxAge ? parseInt(req.query.maxAge as string) : undefined,
        maxDistance: req.query.maxDistance ? parseFloat(req.query.maxDistance as string) : undefined,
        fameMin: req.query.fameMin ? parseInt(req.query.fameMin as string) : undefined,
        fameMax: req.query.fameMax ? parseInt(req.query.fameMax as string) : undefined,
        interests: req.query.interests ? (Array.isArray(req.query.interests) ? req.query.interests : [req.query.interests]) as string[] : undefined,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      };

      // Calculate offset from page
      filters.offset = ((filters.page || 1) - 1) * (filters.limit || 20);

      // Add location filter if maxDistance is specified and we can get user's location
      if (filters.maxDistance) {
        const currentUserProfile = await ProfileModel.getProfileByUserId(userId);
        if (currentUserProfile?.latitude && currentUserProfile?.longitude) {
          filters.location = {
            latitude: currentUserProfile.latitude,
            longitude: currentUserProfile.longitude,
            radiusKm: filters.maxDistance
          };
        }
      }

      const profiles = await ProfileModel.browseProfiles(userId, filters);

      return res.json({
        success: true,
        message: 'Profiles retrieved successfully',
        data: {
          profiles,
          pagination: {
            page: filters.page || 1,
            limit: filters.limit || 20,
            hasMore: profiles.length === (filters.limit || 20)
          }
        }
      });
    } catch (error) {
      console.error('Browse profiles error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }

  /**
   * @swagger
   * /profile/search:
   *   get:
   *     summary: Search profiles with manual filters (no algorithm)
   *     tags: [Profile]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: minAge
   *         schema:
   *           type: integer
   *           minimum: 18
   *         description: Minimum age filter
   *       - in: query
   *         name: maxAge
   *         schema:
   *           type: integer
   *           maximum: 100
   *         description: Maximum age filter
   *       - in: query
   *         name: minFame
   *         schema:
   *           type: number
   *         description: Minimum fame rating
   *       - in: query
   *         name: maxFame
   *         schema:
   *           type: number
   *         description: Maximum fame rating
   *       - in: query
   *         name: tags
   *         schema:
   *           type: string
   *         description: Comma-separated list of interest tags
   *       - in: query
   *         name: city
   *         schema:
   *           type: string
   *         description: City/location filter
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           enum: [age, location, fame, tags]
   *         description: Sort field
   *       - in: query
   *         name: sortOrder
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *         description: Sort order
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 50
   *         description: Results per page
   *     responses:
   *       200:
   *         description: Profiles retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Profile'
   *       401:
   *         description: Unauthorized
   */
  // Search profiles with manual filters (no algorithm)
  static async searchProfiles(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      // Parse query parameters into filters
      const filters: SearchFilters = {
        minAge: req.query.minAge ? parseInt(req.query.minAge as string) : undefined,
        maxAge: req.query.maxAge ? parseInt(req.query.maxAge as string) : undefined,
        minFame: req.query.minFame ? parseInt(req.query.minFame as string) : undefined,
        maxFame: req.query.maxFame ? parseInt(req.query.maxFame as string) : undefined,
        tags: req.query.tags ? (req.query.tags as string).split(',').map(tag => tag.trim().toLowerCase()) : undefined,
        city: req.query.city as string,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      };

      // Calculate offset from page
      filters.offset = ((filters.page || 1) - 1) * (filters.limit || 20);

      const profiles = await ProfileModel.searchProfiles(userId, filters);

      return res.json({
        success: true,
        message: 'Profiles retrieved successfully',
        data: {
          profiles,
          pagination: {
            page: filters.page || 1,
            limit: filters.limit || 20,
            hasMore: profiles.length === (filters.limit || 20)
          }
        }
      });
    } catch (error) {
      console.error('Search profiles error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }

  /**
   * @swagger
   * /profile/search:
   *   get:
   *     summary: Search profiles manually with filters
   *     tags: [Profile]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: minAge
   *         schema:
   *           type: integer
   *           minimum: 18
   *         description: Minimum age filter
   *       - in: query
   *         name: maxAge
   *         schema:
   *           type: integer
   *           maximum: 100
   *         description: Maximum age filter
   *       - in: query
   *         name: minFame
   *         schema:
   *           type: number
   *         description: Minimum fame rating
   *       - in: query
   *         name: maxFame
   *         schema:
   *           type: number
   *         description: Maximum fame rating
   *       - in: query
   *         name: tags
   *         schema:
   *           type: string
   *         description: Comma-separated interest tags
   *       - in: query
   *         name: city
   *         schema:
   *           type: string
   *         description: City name filter
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           enum: [age, location, fame, tags]
   *         description: Sort field
   *       - in: query
   *         name: sortOrder
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *         description: Sort order
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 50
   *         description: Results per page
   *     responses:
   *       200:
   *         description: Search results retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *                   properties:
   *                     profiles:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/Profile'
   *                     pagination:
   *                       type: object
   *                       properties:
   *                         page:
   *                           type: integer
   *                         limit:
   *                           type: integer
   *                         hasMore:
   *                           type: boolean
   *       401:
   *         description: Unauthorized
   */
  // Search profiles manually
  static async searchProfiles(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      // Parse query parameters into filters
      const filters: SearchFilters = {
        minAge: req.query.minAge ? parseInt(req.query.minAge as string) : undefined,
        maxAge: req.query.maxAge ? parseInt(req.query.maxAge as string) : undefined,
        minFame: req.query.minFame ? parseInt(req.query.minFame as string) : undefined,
        maxFame: req.query.maxFame ? parseInt(req.query.maxFame as string) : undefined,
        tags: req.query.tags ? (req.query.tags as string).split(',').map(tag => tag.trim()) : undefined,
        city: req.query.city as string,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      };

      // Calculate offset from page
      filters.offset = ((filters.page || 1) - 1) * (filters.limit || 20);

      const profiles = await ProfileModel.searchProfiles(userId, filters);

      return res.json({
        success: true,
        message: 'Search results retrieved successfully',
        data: {
          profiles,
          pagination: {
            page: filters.page || 1,
            limit: filters.limit || 20,
            hasMore: profiles.length === (filters.limit || 20)
          }
        }
      });
    } catch (error) {
      console.error('Search profiles error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }

  /**
   * @swagger
   * /profile/like/{targetUserId}:
   *   post:
   *     summary: Like a user
   *     tags: [Social Actions]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: targetUserId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Target user ID to like
   *     responses:
   *       200:
   *         description: User liked successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *                   properties:
   *                     isMatch:
   *                       type: boolean
   *       400:
   *         description: Cannot like yourself or user already liked
   *       404:
   *         description: User not found
   *       401:
   *         description: Unauthorized
   */
  
  /**
   * @swagger
   * /profile/likes/received:
   *   get:
   *     summary: Get likes received by the current user
   *     tags: [Profile]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Likes received successfully retrieved
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                       fromUser:
   *                         type: string
   *                       createdAt:
   *                         type: string
   *                         format: date-time
   *                       user:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                           username:
   *                             type: string
   *                           firstName:
   *                             type: string
   *                           lastName:
   *                             type: string
   *                           profilePicture:
   *                             type: string
   *       401:
   *         description: Unauthorized
   */
  // Get likes received by the current user
  static async getLikesReceived(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const likes = await ProfileModel.getLikesReceived(userId);

      return res.json({
        success: true,
        message: 'Likes received retrieved successfully',
        data: likes
      });
    } catch (error) {
      console.error('Get likes received error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Like a user
  static async likeUser(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { targetUserId } = req.params;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      if (userId === targetUserId) {
        return res.status(400).json({
          success: false,
          message: 'You cannot like yourself'
        });
      }

      // Enforce "no like without profile picture" rule
      const likerProfile = await ProfileModel.getProfileByUserId(userId);
      const hasProfilePicture = !!likerProfile && Array.isArray(likerProfile.pictures) && likerProfile.pictures.length > 0;

      if (!hasProfilePicture) {
        return res.status(400).json({
          success: false,
          message: 'You must add a profile picture before liking other users.'
        });
      }

      // Prevent likes when either user has blocked the other
      const hasBlockedTarget = await ProfileModel.isUserBlocked(userId, targetUserId);
      const isBlockedByTarget = await ProfileModel.isUserBlocked(targetUserId, userId);

      if (hasBlockedTarget || isBlockedByTarget) {
        return res.status(403).json({
          success: false,
          message: 'You cannot like this user because a block is in place.'
        });
      }

      const result = await ProfileModel.likeUser(userId, targetUserId);

      // Get the liker's username for notifications
      const liker = await UserModel.findById(userId);
      
      if (liker) {
        // Send "like received" notification to the target user
        await NotificationService.notifyLikeReceived(
          targetUserId,
          userId,
          liker.username
        );

        // If it's a match, send match notification to both users
        if (result.connection) {
          const targetUser = await UserModel.findById(targetUserId);
          if (targetUser) {
            await NotificationService.notifyMatch(userId, targetUserId, targetUser.username);
            await NotificationService.notifyMatch(targetUserId, userId, liker.username);
          }
        }
      }

      return res.json({
        success: true,
        message: result.connection ? 'It\'s a match!' : 'User liked successfully',
        data: result
      });
    } catch (error) {
      console.error('Like user error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Unlike a user
  static async unlikeUser(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { targetUserId } = req.params;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      await ProfileModel.unlikeUser(userId, targetUserId);

      // Send unlike notification
      const unliker = await UserModel.findById(userId);
      if (unliker) {
        await NotificationService.notifyUnlike(
          targetUserId,
          userId,
          unliker.username
        );
      }

      return res.json({
        success: true,
        message: 'User unliked successfully'
      });
    } catch (error) {
      console.error('Unlike user error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Block a user
  static async blockUser(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { targetUserId } = req.params;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      if (userId === targetUserId) {
        return res.status(400).json({
          success: false,
          message: 'You cannot block yourself'
        });
      }

      const block = await ProfileModel.blockUser(userId, targetUserId);

      // Mark any unread messages from the blocked user as "read" for the blocker
      // so they no longer count towards unread chat badges
      try {
        await MessageModel.markAsRead(userId, targetUserId);
      } catch (markReadError) {
        console.error('Error marking messages as read after block:', markReadError);
      }

      return res.json({
        success: true,
        message: 'User blocked successfully',
        data: block
      });
    } catch (error) {
      console.error('Block user error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * @swagger
   * /profile/report/{targetUserId}:
   *   post:
   *     summary: Report a user
   *     tags: [Social Actions]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: targetUserId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Target user ID to report
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ReportInput'
   *     responses:
   *       201:
   *         description: User reported successfully
   *       400:
   *         description: Validation error or cannot report yourself
   *       404:
   *         description: User not found
   *       401:
   *         description: Unauthorized
   */
  // Report a user
  static async reportUser(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const userId = req.user?.userId;
      const { targetUserId } = req.params;
      const { reason } = req.body;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      if (userId === targetUserId) {
        return res.status(400).json({
          success: false,
          message: 'You cannot report yourself'
        });
      }

      const report = await ProfileModel.reportUser(userId, targetUserId, reason);

      return res.json({
        success: true,
        message: 'User reported successfully',
        data: report
      });
    } catch (error) {
      console.error('Report user error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Helper method to check and update profile completion status
   */
  static async checkAndUpdateProfileCompletion(userId: string): Promise<void> {
    try {
      const profile = await ProfileModel.getProfileByUserId(userId);
      
      if (profile) {
        // Check if profile is complete
        const hasGender = !!profile.gender;
        const hasSexualPreference = !!profile.sexualPreference;
        const hasBio = !!profile.bio && profile.bio.trim().length > 0;
        const hasAtLeastOnePicture = profile.pictures && profile.pictures.length > 0;
        const hasInterests = profile.interests && profile.interests.length > 0;
        const hasLocation =
          ((profile.latitude !== null && profile.latitude !== undefined) &&
            (profile.longitude !== null && profile.longitude !== undefined)) ||
          !!profile.neighborhood;

        const isComplete =
          hasGender &&
          hasSexualPreference &&
          hasBio &&
          hasAtLeastOnePicture &&
          hasInterests &&
          hasLocation;

        // Update user's profile completion status
        await UserModel.setProfileCompleted(userId, isComplete);
        
        // Update profile completeness score
        await ProfileModel.updateCompleteness(userId);
      }
    } catch (error) {
      console.error('Error checking profile completion:', error);
      // Don't throw error, just log it
    }
  }

  /**
   * @swagger
   * /profile/fix-neighborhoods:
   *   patch:
   *     summary: Fix coordinate-based neighborhoods by converting to city names
   *     tags: [Profile]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Neighborhoods updated successfully
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  static async fixNeighborhoods(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      // Get user's profile
      const profile = await ProfileModel.getProfileByUserId(userId);
      
      if (!profile) {
        res.status(404).json({
          success: false,
          message: 'Profile not found',
        });
        return;
      }

      // Check if neighborhood contains coordinates and needs fixing
      if (profile.neighborhood && isCoordinateFormat(profile.neighborhood)) {
        const coordinates = extractCoordinatesFromString(profile.neighborhood);
        
        if (coordinates) {
          console.log(`Fixing neighborhood for user ${userId}: ${profile.neighborhood}`);
          
          // Convert coordinates to city name
          const cityName = await reverseGeocode(coordinates.latitude, coordinates.longitude);
          
          // Update the profile with the new city name
          await ProfileModel.updateProfile(userId, { neighborhood: cityName });
          
          console.log(`Updated neighborhood to: ${cityName}`);
          
          res.status(200).json({
            success: true,
            message: 'Neighborhood updated successfully',
            data: {
              oldNeighborhood: profile.neighborhood,
              newNeighborhood: cityName
            }
          });
          return;
        }
      }

      res.status(200).json({
        success: true,
        message: 'No neighborhood fix needed',
        data: {
          currentNeighborhood: profile.neighborhood
        }
      });
    } catch (error) {
      console.error('Error fixing neighborhood:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fix neighborhood',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }

  /**
   * @swagger
   * /profile/blocked:
   *   get:
   *     summary: Get list of blocked users
   *     tags: [Social Actions]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Blocked users retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                       userId:
   *                         type: string
   *                       username:
   *                         type: string
   *                       firstName:
   *                         type: string
   *                       lastName:
   *                         type: string
   *                       profilePicture:
   *                         type: string
   *                       blockedAt:
   *                         type: string
   *                         format: date-time
   *       401:
   *         description: Unauthorized
   */
  // Get blocked users
  static async getBlockedUsers(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const blockedUsers = await ProfileModel.getBlockedUsers(userId);

      return res.json({
        success: true,
        data: blockedUsers
      });
    } catch (error) {
      console.error('Get blocked users error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }

  /**
   * @swagger
   * /profile/unblock/{targetUserId}:
   *   delete:
   *     summary: Unblock a user
   *     tags: [Social Actions]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: targetUserId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Target user ID to unblock
   *     responses:
   *       200:
   *         description: User unblocked successfully
   *       400:
   *         description: Cannot unblock yourself or user not blocked
   *       404:
   *         description: Block not found
   *       401:
   *         description: Unauthorized
   */
  // Unblock a user
  static async unblockUser(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { targetUserId } = req.params;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      if (userId === targetUserId) {
        return res.status(400).json({
          success: false,
          message: 'You cannot unblock yourself'
        });
      }

      await ProfileModel.unblockUser(userId, targetUserId);

      return res.json({
        success: true,
        message: 'User unblocked successfully'
      });
    } catch (error) {
      console.error('Unblock user error:', error);
      
      if ((error as Error).message === 'No block found to remove') {
        return res.status(404).json({
          success: false,
          message: 'User is not blocked'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }

  /**
   * @swagger
   * /api/profile/views:
   *   get:
   *     summary: Get profile views for the current user
   *     tags: [Profile]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Page number for pagination
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *           maximum: 50
   *         description: Number of views per page
   *     responses:
   *       200:
   *         description: Profile views retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *                   properties:
   *                     views:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                           viewerId:
   *                             type: string
   *                           createdAt:
   *                             type: string
   *                             format: date-time
   *                           viewer:
   *                             type: object
   *                             properties:
   *                               username:
   *                                 type: string
   *                               firstName:
   *                                 type: string
   *                               lastName:
   *                                 type: string
   *                               profilePicture:
   *                                 type: string
   *                     total:
   *                       type: integer
   *                     hasMore:
   *                       type: boolean
   *                     currentPage:
   *                       type: integer
   *                     totalPages:
   *                       type: integer
   *       401:
   *         description: Unauthorized
   */
  static async getProfileViews(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));

      const result = await ProfileModel.getProfileViews(userId, page, limit);
      const totalPages = Math.ceil(result.total / limit);

      return res.json({
        success: true,
        message: 'Profile views retrieved successfully',
        data: {
          views: result.views,
          total: result.total,
          hasMore: result.hasMore,
          currentPage: page,
          totalPages
        }
      });

    } catch (error) {
      console.error('Get profile views error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }

  // Helper function to check if we should send a profile view notification
  // Only send notification if last notification was sent more than 10 minutes ago
  private static async shouldSendViewNotification(viewerId: string, viewedUserId: string): Promise<boolean> {
    try {
      const pool = (await import('../config/database')).default;
      
      // Check for recent notification by same viewer to avoid spam
      const recentNotificationQuery = `
        SELECT created_at 
        FROM notifications 
        WHERE from_user_id = $1 
          AND user_id = $2 
          AND type = 'profile_view'
        ORDER BY created_at DESC 
        LIMIT 1
      `;
      
      const recentNotif = await pool.query(recentNotificationQuery, [viewerId, viewedUserId]);
      
      if (recentNotif.rows.length > 0) {
        const lastNotifTime = new Date(recentNotif.rows[0].created_at);
        const currentTime = new Date();
        const timeDiffMs = currentTime.getTime() - lastNotifTime.getTime();
        const tenMinutesMs = 10 * 60 * 1000; // 10 minutes in milliseconds
        
        // Don't send notification if last one was within 10 minutes
        if (timeDiffMs < tenMinutesMs) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error checking notification eligibility:', error);
      return false; // Don't send notification if there's an error
    }
  }
}
