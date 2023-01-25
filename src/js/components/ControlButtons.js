import React, {useEffect} from 'react';

const ControlButtons = ({handleWebcamStart, handleWebcamStop, handleSnapPicture, handleS3Upload, handleDownload}) => {

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
