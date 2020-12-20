import { Router } from 'express';

import SuperUser from '../controllers/superuser.controller';
import checkSuperUserToken from '../middleware/checkSuperUserToken';

const router = Router();

router.post('/superuser/signup', SuperUser.signup);
router.post('/superuser/login', SuperUser.login);
router.put('/superuser/org/:orgId/disable', checkSuperUserToken, SuperUser.disableGroup);
router.put('/superuser/org/:orgId/verify', checkSuperUserToken, SuperUser.verifyOrg);
router.get('/superuser/app/analytics', checkSuperUserToken, SuperUser.AppDetails);
router.get('/superuser/orgs/all', checkSuperUserToken, SuperUser.FetchAllOrgs);
router.get('/superuser/orgs/all', checkSuperUserToken, SuperUser.FetchAllOrgs);
router.get('/superuser/users/all', checkSuperUserToken, SuperUser.FetchAllUsers);
export default router;
