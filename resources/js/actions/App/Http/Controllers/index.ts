import Api from './Api'
import Settings from './Settings'
const Controllers = {
    Api: Object.assign(Api, Api),
Settings: Object.assign(Settings, Settings),
}

export default Controllers