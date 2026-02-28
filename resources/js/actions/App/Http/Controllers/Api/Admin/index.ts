import GroupController from './GroupController';
import UserController from './UserController';
import VaultItemController from './VaultItemController';
const Admin = {
    UserController: Object.assign(UserController, UserController),
    GroupController: Object.assign(GroupController, GroupController),
    VaultItemController: Object.assign(
        VaultItemController,
        VaultItemController,
    ),
};

export default Admin;
