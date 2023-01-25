import './App.css';

import {Amplify, Storage} from "aws-amplify";
import {withAuthenticator} from '@aws-amplify/ui-react';

import awsExports from './aws-exports';
import ControlButtons from "./js/components/ControlButtons";
import CameraCanvas from "./js/components/CameraCanvas";
import CropPlaceHolder from "./js/components/CropPlaceHolder";
import LogoutCTA from "./js/components/LogoutCTA";
import {useEffect, useState} from "react";
import Webcam from "webcam-easy";
import {Buffer} from "buffer";

Amplify.configure(awsExports);

function App({ signOut, user }) {
    const [picture, setPicture] = useState(null);
    const [pictureBase64, setPictureBase64] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [webcamElement, setWebcamElement] = useState(null);
    const [canvasElement, setCanvasElement] = useState(null);
    const [webcam, setWebcam] = useState(null);

    const IDENTITY_POOL_ID = process.env.REACT_APP_IDENTITY_POOL_ID;
    const INPUT_BUCKET = process.env.REACT_APP_INPUT_BUCKET;
    const OUTPUT_BUCKET = process.env.REACT_APP_OUTPUT_BUCKET;
    const REGION = process.env.REACT_APP_REGION;
    const USER_POOL_ID = process.env.REACT_APP_USER_POOL_ID;
    const USER_POOL_WEB_CLIENT_ID = process.env.REACT_APP_USER_POOL_WEB_CLIENT_ID;

    const keyPrefix = splitUserEmail(user.attributes.email);
    const imageKey = `${keyPrefix}-user-photo.png`;

    useEffect(() => {

        const onPageLoad = () => {
            setWebcamElement(document.getElementById('webcam'));
            setCanvasElement(document.getElementById('canvas'));
            setWebcam(new Webcam(webcamElement, 'user', canvasElement));
        }

        // Check if the page has already loaded
        if (document.readyState === 'complete') {
            onPageLoad();
        } else {
            window.addEventListener('load', onPageLoad);
            // Remove the event listener when component unmounts
            return () => window.removeEventListener('load', onPageLoad);
        }
    }, [canvasElement, webcamElement]);

    const configureInputBucket = () => {
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
     * Parses url for the user's image stored in S3 and uploads image after some wait. The timeout is used
     * to give S3 enough process time to reassign the image in storage.
     */
    const load = () => {
        const imageUrl = `https://${OUTPUT_BUCKET}.s3.${REGION}.amazonaws.com/public/${imageKey}`;
        setTimeout(function () {
            document.getElementById('cropped-image').src = imageUrl;
        }, 10000);

        return imageUrl;
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

    const handleWebcamStart = () => {
        setPicture(null);
        webcam.start().then(result => {
            console.log("webcam started");
        }).catch(err => {
            console.log(err);
        });
    };

    const handleWebcamStop = () => {
        webcam.stop();
    };

    const handleSnapPicture = async () => {
        setPicture(webcam.snap());
        setPictureBase64(picture);
    };

    const handleS3Upload = async () => {
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
                setPicture(null);
                setImageUrl(load());

            } catch (error) {
                console.log("Error uploading file: ", error);
            }
        }
    }

    const handleDownload = () => {
        if (pictureBase64 !== null) {
            // downloads image in some random unknown text file..fix!
            window.location.href = pictureBase64.replace('image/png', 'image/octet-stream');
        }
    };

    return (
        <div id={'app'}>
            <LogoutCTA signOut={signOut}></LogoutCTA>
            <CameraCanvas></CameraCanvas>
            <ControlButtons
              handleWebcamStart={handleWebcamStart}
              handleWebcamStop={handleWebcamStop}
              handleSnapPicture={handleSnapPicture}
              handleS3Upload={handleS3Upload}
              handleDownload={handleDownload}
            />
            <CropPlaceHolder></CropPlaceHolder>
        </div>
    );
}

export default withAuthenticator(App);
