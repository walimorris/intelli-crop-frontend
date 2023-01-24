import './App.css';

import {Amplify} from "aws-amplify";
import {withAuthenticator} from '@aws-amplify/ui-react';

import awsExports from './aws-exports';
import ControlButtons from "./js/components/ControlButtons";
import CameraCanvas from "./js/components/CameraCanvas";
import CropPlaceHolder from "./js/components/CropPlaceHolder";
import LogoutCTA from "./js/components/LogoutCTA";

Amplify.configure(awsExports);

function App({ signOut, user }) {
    return (
        <div id={'app'}>
            <LogoutCTA signOut={signOut}></LogoutCTA>
            <CameraCanvas></CameraCanvas>
            <ControlButtons user={user}></ControlButtons>
            <CropPlaceHolder></CropPlaceHolder>
        </div>
    );
}

export default withAuthenticator(App);
