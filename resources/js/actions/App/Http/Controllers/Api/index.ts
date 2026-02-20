import Admin from './Admin'
import VaultItemController from './VaultItemController'
import VaultItemShareLinkController from './VaultItemShareLinkController'
const Api = {
    VaultItemShareLinkController: Object.assign(VaultItemShareLinkController, VaultItemShareLinkController),
Admin: Object.assign(Admin, Admin),
VaultItemController: Object.assign(VaultItemController, VaultItemController),
}

export default Api