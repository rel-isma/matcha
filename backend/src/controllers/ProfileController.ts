import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ProfileModel } from '../models/Profile';
import { UserModel } from '../models/User';
import { ApiResponse, CreateProfileInput, UpdateProfileInput, BrowseFilters } from '../types';
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
        message: 'Interests added successfully',
        data: updatedProfile
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

      const profile = await ProfileModel.getPublicProfile(username);
      
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

      // Record profile view
      await ProfileModel.recordProfileView(userId, profile.userId);

      return res.json({
        success: true,
        message: 'Profile retrieved successfully',
        data: profile
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

      const result = await ProfileModel.likeUser(userId, targetUserId);

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
        
        const isComplete = hasGender && hasSexualPreference && hasBio && hasAtLeastOnePicture && hasInterests;
        
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
      const userId = req.user?.id;
      
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
}
