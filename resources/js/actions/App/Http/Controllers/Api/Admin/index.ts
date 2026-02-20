import UserController from './UserController'
import GroupController from './GroupController'
import VaultItemController from './VaultItemController'
const Admin = {
    UserController: Object.assign(UserController, UserController),
GroupController: Object.assign(GroupController, GroupController),
VaultItemController: Object.assign(VaultItemController, VaultItemController),
}

export default Admin