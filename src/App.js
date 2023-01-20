import './App.css';
import React, {useEffect} from 'react';
import {Buffer} from 'buffer';

import {Amplify, Auth, Storage} from "aws-amplify";
import {withAuthenticator} from '@aws-amplify/ui-react';
import Webcam from 'webcam-easy';

import awsExports from './aws-exports';
import ControlButtons from "./js/components/ControlButtons";
import CameraCanvas from "./js/components/CameraCanvas";
import CropPlaceHolder from "./js/components/CropPlaceHolder";
import LogoutCTA from "./js/components/LogoutCTA";

Amplify.configure(awsExports);

function App({ signOut, user }) {

    const IDENTITY_POOL_ID = process.env.REACT_APP_IDENTITY_POOL_ID;
    const INPUT_BUCKET = process.env.REACT_APP_INPUT_BUCKET;
    const OUTPUT_BUCKET = process.env.REACT_APP_OUTPUT_BUCKET;
    const REGION = process.env.REACT_APP_REGION;
    const USER_POOL_ID = process.env.REACT_APP_USER_POOL_ID;
    const USER_POOL_WEB_CLIENT_ID = process.env.REACT_APP_USER_POOL_WEB_CLIENT_ID;

    const keyPrefix = splitUserEmail(user.attributes.email);
    const imageKey = `${keyPrefix}-user-photo.png`;

    useEffect(() => {

        const webcamElement = document.getElementById('webcam');
        const canvasElement = document.getElementById('canvas');
        const webcam = new Webcam(webcamElement, 'user', canvasElement);

        const stopButton = document.getElementById('stop-button');
        const snapButton = document.getElementById('snap-button');
        const startButton = document.getElementById('start-button');
        const uploadS3Button = document.getElementById('uploadS3-button');
        const logoutButton = document.getElementById('logout-button');

        let picture = null;

        logoutButton.addEventListener('click', async () => {
            try {
                await Auth.signOut({ global: true });
            } catch (error) {
                console.log('error signing out: ', error);
            }
        });

        stopButton.addEventListener('click', () => {
            webcam.stop();
        });

        snapButton.addEventListener('click', async () => {
            picture = webcam.snap();
        });

        uploadS3Button.addEventListener('click', async () => {
            configureInputBucket();
            if (picture !== null) {
                console.log('Image is ready');
                const buf = Buffer.from(picture.replace(/^data:image\/\w+;base64,/, ""),'base64');

                try {
                    await Storage.put(imageKey, buf, {
                        contentType: "image/png",
                        contentEncoding: 'base64'
                    });
                    console.log("Successfully uploaded file!");
                    picture = null;
                    load();

                } catch (error) {
                    console.log("Error uploading file: ", error);
                }
            }
        })

        startButton.addEventListener('click', () => {
            picture = null;
            webcam.start()
                .then(result => {
                    console.log("webcam started");
                })
                .catch(err => {
                    console.log(err);
                });
        });
    }, []);

    function configureInputBucket() {
        Amplify.configure({
            Auth: {
                identityPoolId: IDENTITY_POOL_ID,
                region: REGION,
                userPoolId: USER_POOL_ID,
                userPoolWebClientId: USER_POOL_WEB_CLIENT_ID,
            },
            Storage: {
                AWSS3: {
                    bucket: INPUT_BUCKET,
                    region: REGION,
                }
            }
        });
    }

    /**
     * Splits user email attribute and pulls out the name value in the user's email address.
     *
     * @param email Cognito user email attribute
     * @return {*}
     */
    function splitUserEmail(email) {
        const splitArray = email.split('@');
        return splitArray[0];
    }

    /**
     * Parses url for the user's image stored in S3 and uploads image after some wait. The timeout is used
     * to give S3 enough process time to reassign the image in storage.
     */
    function load() {
        setTimeout(function () {
            document.getElementById('cropped-image').src = `https://${OUTPUT_BUCKET}.s3.${REGION}.amazonaws.com/public/${imageKey}`;
        }, 10000);
    }

    return (
        <div id={'app'}>
            <LogoutCTA></LogoutCTA>
            <CameraCanvas></CameraCanvas>
            <ControlButtons></ControlButtons>
            <CropPlaceHolder></CropPlaceHolder>
        </div>
    );
}

export default withAuthenticator(App);
