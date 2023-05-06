import express from 'express';
import {login, loadAdmin} from './controllers/admin.js';
import isAuthenticated from './middlewares/auth.js';
import {addPage, getStory, updateStory, deleteStory, detailsStory, crateStory, getVariable, getSinglePage} from './controllers/story.js';
import {userRegister, userLogin, loadUser, unlockCharacter, logoutUser, updateUnlockCharacter, selectCharacter, updateProfile, updatePassword, forgotPassword, resetPassword} from './controllers/user.js';
import isUserAuthenticated from './middlewares/userAuth.js';
import {addCharacterImage, getCharacter, getAvaibleAndLockedCharacter, getCharacterImage} from './controllers/character.js';
import {addCharacterText, getCharacterText, deleteVariable, addHomeText, getHomeText, getHomePageCharacter, addHomePageCharacterImage,getHomeImageForUser} from './controllers/cloth.js';

const router = express.Router();

// admin routes
// router.route('/admin/register').post(register);
router.route('/admin/login').post(login);
router.route('/admin/load-admin').get(isAuthenticated,loadAdmin);

// story routes
router.route('/story/add-page/:id').post(isAuthenticated,addPage);
router.route('/story/update/:id/:page').put(isAuthenticated,updateStory);
router.route('/story/delete/:id').delete(isAuthenticated, deleteStory);
router.route('/story/get').get(getStory);
router.route('/story/details/:id').get(detailsStory);
router.route('/story/create').post(isAuthenticated, crateStory);
router.route('/story/variable').get(getVariable);
router.route('/story/get-page/:id/:page').get(isAuthenticated,getSinglePage);

// user route
router.route('/user/register').post(userRegister);
router.route('/user/login').post(userLogin);
router.route('/user/load-me').get(isUserAuthenticated, loadUser);
router.route('/user/unclock-character').post(isUserAuthenticated, unlockCharacter);
router.route('/user/logout').get(isUserAuthenticated, logoutUser);
router.route('/user/update-unlock-character').post(isUserAuthenticated, updateUnlockCharacter);
router.route('/user/select-character').post(isUserAuthenticated, selectCharacter);
router.route('/user/update-profile').post(isUserAuthenticated,updateProfile);
router.route('/user/update-password').post(isUserAuthenticated, updatePassword);
router.route('/user/forgot-password').post(forgotPassword);
router.route('/user/reset-password').post(resetPassword);

// character route
router.route('/character/add').post(isAuthenticated, addCharacterImage);
router.route('/character/get').get(isAuthenticated, getCharacter);
router.route('/character/unlock').get(isUserAuthenticated, getAvaibleAndLockedCharacter);
router.route('/character/charatcer-image').get(isAuthenticated, getCharacterImage);


// add character text route
router.route('/character-text/add').post(isAuthenticated, addCharacterText);
router.route('/character-text/get').get(getCharacterText);
router.route('/variable/delete/:id').delete(isAuthenticated, deleteVariable);
router.route('/home-text/add').post(isAuthenticated, addHomeText);
router.route('/home-text/get').get(getHomeText);
router.route('/home-character/get').get(isAuthenticated, getHomePageCharacter);
router.route('/home-character/add').post(isAuthenticated, addHomePageCharacterImage);
router.route('/home-user-character/get').get(isUserAuthenticated, getHomeImageForUser);

export default router;