import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';
import './Upload.css'
import config from '../configs/config';

const FileUpload = ({uploadStatus, user_id, new_chat_id, chat_id, setIsLoading}) => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if(chat_id==null)
     setFile(null)
}, [chat_id]);

useEffect(() => {
    if(file)
    {
        handleUpload()
        const div = document.getElementById('upload-div-title')
        div.textContent = "Thanks for the upload. Please wait for the response"
    }
    else{
        const div = document.getElementById('upload-div-title')
        div.textContent = "Please upload the CSV file here, to start interacting"
    }
}, [file]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (file) {
      setIsLoading(true)
      const formData = new FormData();
      formData.append('csvFile', file);
      formData.append('user_id', user_id);
  
      try {
        const response = await fetch(`${config.API_ENDPOINT}/api/upload-data`, {
          method: 'POST',
          body: formData,
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            if (progress < 100)
              setUploadProgress(progress);
          },
        });
  
        if (response.ok) {
          const data = await response.json();
          new_chat_id(data.chat_id);
          uploadStatus(true);
          console.log('File uploaded successfully.');
        } else {
          console.error('File upload failed.');
        }
      } catch (error) {
        console.error('File upload failed.', error);
      } finally{
        setIsLoading(false)
      }
    }
  };
  

  return (
    <div className='upload-div' >
      <h2 id='upload-div-title'>Please upload the CSV file here, to start interacting</h2>
        <label for="file-upload"  className={`custom-file-upload  ${file ? 'uploaded' : ''}`}>
            <FontAwesomeIcon className="upload-icon" icon={faCloudArrowUp} />{file==null?'Upload File': file.name }
        </label>
        <input id="file-upload" disabled={!(file==null)} type="file" onChange={handleFileChange} accept=".csv"
/>
      {/* <button onClick={handleUpload}> Upload File</button> */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="progress-bar">
          <div
            className="progress"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
