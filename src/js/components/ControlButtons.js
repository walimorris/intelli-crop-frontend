import React, {useEffect, useState} from 'react';
import Webcam from "webcam-easy";
import {Buffer} from "buffer";
import {Amplify, Storage} from "aws-amplify";

const ControlButtons = ({user}) => {

    const [picture, setPicture] = useState(null);
    const [pictureBase64, setPictureBase64] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);

    const IDENTITY_POOL_ID = process.env.REACT_APP_IDENTITY_POOL_ID;
    const INPUT_BUCKET = process.env.REACT_APP_INPUT_BUCKET;
    const OUTPUT_BUCKET = process.env.REACT_APP_OUTPUT_BUCKET;
    const REGION = process.env.REACT_APP_REGION;
    const USER_POOL_ID = process.env.REACT_APP_USER_POOL_ID;
    const USER_POOL_WEB_CLIENT_ID = process.env.REACT_APP_USER_POOL_WEB_CLIENT_ID;

    const keyPrefix = splitUserEmail(user.attributes.email);
    const imageKey = `${keyPrefix}-user-photo.png`;

    const webcamElement = document.getElementById('webcam');
    const canvasElement = document.getElementById('canvas');
    const webcam = new Webcam(webcamElement, 'user', canvasElement);

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

    useEffect(() => {
        document.getElementById('start-button').addEventListener('click', handleWebcamStart);
        document.getElementById('stop-button').addEventListener('click', handleWebcamStop);
        document.getElementById('snap-button').addEventListener('click', handleSnapPicture);
        document.getElementById('uploadS3-button').addEventListener('click', handleS3Upload);
        document.getElementById('download-button').addEventListener('click', handleDownload);
        return () => {
            document.getElementById('start-button').removeEventListener('click', handleWebcamStart);
            document.getElementById('stop-button').removeEventListener('click', handleWebcamStop);
            document.getElementById('snap-button').removeEventListener('click', handleSnapPicture);
            document.getElementById('uploadS3-button').removeEventListener('click', handleS3Upload);
            document.getElementById('download-button').removeEventListener('click', handleDownload);
        }
    });

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
        <div id={'controls'}>
            <button id={'start-button'} onClick={handleWebcamStart}>Start</button>
            <button id={'stop-button'} onClick={handleWebcamStop}>Stop</button>
            <button id={'snap-button'} onClick={handleSnapPicture}>Snap</button>
            <button id={'uploadS3-button'} onClick={handleS3Upload}>Upload</button>
            <button id={'download-button'} onClick={handleDownload}>Download</button>
        </div>
    )
};

export default ControlButtons;
