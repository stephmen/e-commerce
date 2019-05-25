import PleaseSignIn from '../components/PleaseSignIn';
import Permissions from '../components/PermissionsOLD';
import Link from 'next/link';
const PermissionsPage   = props => (
  <div>
    <PleaseSignIn>
      <Permissions />
    </PleaseSignIn>
  </div>
)
export default PermissionsPage