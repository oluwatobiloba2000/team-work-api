/* eslint-disable max-len */
import { Router } from 'express';

import Organization from '../controllers/org.controller';
import checkToken from '../middleware/checkToken';

const router = Router();

router.post('/org/create', checkToken, Organization.Create);
router.get('/org/:orgId/details', checkToken, Organization.orgDetails);
router.get('/user/org', checkToken, Organization.AllUserOrg);

router.put('/org/:orgId/admin/:userId/add', checkToken, Organization.AssignAdmin);

// avaliable to organization owners only
router.put('/org/:orgId/admin/:userId/dismiss', checkToken, Organization.DismissAdmin);

router.put('/admin/org/:orgId/privacy', checkToken, Organization.Privacy);

router.get('/org/public/all', checkToken, Organization.FetchAllPublicOrgs);
export default router;
