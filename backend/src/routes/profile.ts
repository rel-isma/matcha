import { Router } from 'express';
import { ProfileController } from '../controllers/ProfileController';
import { authenticateToken } from '../middleware/auth';
import { requireProfileCompletion } from '../middleware/profileCompletion';
import { handleValidationErrors } from '../middleware/validation';
import { 
  updateProfileValidation, 
  addInterestsValidation,
  browseValidation,
  reportUserValidation,
  userIdParamValidation,
  usernameParamValidation,
  pictureIdParamValidation,
  interestIdParamValidation
} from '../utils/validation-extended';
import { 
  uploadSingle, 
  processImage, 
  handleUploadError 
} from '../middleware/upload';

const router = Router();

// All profile routes require authentication
router.use(authenticateToken);

// Profile management (these routes don't require completed profile for initial setup)
router.get('/me', ProfileController.getMyProfile);
router.put('/me', updateProfileValidation, handleValidationErrors, ProfileController.updateMyProfile);

// Location update endpoint (allows GPS/manual/default location setting)
router.post('/location', ProfileController.updateLocation);

// Picture management (needed for profile completion)
router.post('/me/pictures', 
  uploadSingle, 
  handleUploadError, 
  processImage, 
  ProfileController.uploadPicture
);
router.delete('/me/pictures/:pictureId', 
  pictureIdParamValidation, 
  handleValidationErrors, 
  ProfileController.deletePicture
);

// Interest management (needed for profile completion)
router.post('/me/interests', 
  addInterestsValidation, 
  handleValidationErrors, 
  ProfileController.addInterests
);
router.delete('/me/interests/:interestId', 
  interestIdParamValidation, 
  handleValidationErrors, 
  ProfileController.removeInterest
);

// All routes below require completed profile
router.use(requireProfileCompletion);

// Public profiles
router.get('/user/:username', 
  usernameParamValidation, 
  handleValidationErrors, 
  ProfileController.getPublicProfile
);

// Browse profiles
router.get('/browse', 
  browseValidation, 
  handleValidationErrors, 
  ProfileController.browseProfiles
);

// Utility routes
router.patch('/fix-neighborhoods', ProfileController.fixNeighborhoods);

// Social actions
router.get('/likes/received', ProfileController.getLikesReceived);
router.post('/like/:targetUserId', 
  userIdParamValidation, 
  handleValidationErrors, 
  ProfileController.likeUser
);
router.delete('/like/:targetUserId', 
  userIdParamValidation, 
  handleValidationErrors, 
  ProfileController.unlikeUser
);
router.post('/block/:targetUserId', 
  userIdParamValidation, 
  handleValidationErrors, 
  ProfileController.blockUser
);
router.post('/report/:targetUserId', 
  userIdParamValidation, 
  reportUserValidation, 
  handleValidationErrors, 
  ProfileController.reportUser
);

export default router;
