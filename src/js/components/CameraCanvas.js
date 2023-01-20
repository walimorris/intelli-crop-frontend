import React from 'react';

const CameraCanvas = () => {

    return (
        <div id={'camera-canvas'}>
            <video id={'webcam'} autoPlay playsInline width={635} height={400}></video>
            <canvas id={'canvas'} className={'d-none'}></canvas>
        </div>
    )
};

export default CameraCanvas;
