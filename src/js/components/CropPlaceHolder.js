import React from 'react';

const CropPlaceHolder = () => {

    return (
        <div id={'crop-placeholder'}>
            <img className={'NO-CACHE'} src={'https://output-intelli-crop.s3.us-west-2.amazonaws.com/public/placeholder.jpg'} id={'cropped-image'} alt={'placeholder'}/>
        </div>
    )
};

export default CropPlaceHolder;
