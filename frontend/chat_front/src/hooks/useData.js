import { useState, useEffect, useRef } from 'react';

const useProjectionData = ({user_id, chat_id}) => {

  const load_msg_api = async (user_id, chat_id) => {
    try {
            const response = await fetch('http://127.0.0.1:5001/api/load-messages', {
            method: 'POST',
            body: JSON.stringify({
                user_id: user_id,
                chat_id : chat_id,
                }),
            headers: {
                'Content-Type': 'application/json',
            },
            });

            if (response.ok) {
            const data = await response.json();
            console.log(data)
            } else {
            console.log('Error occurred while fetching data.');
            }
        } catch (error) {
            console.log('Error occurred while fetching data.');
        }
    }

  return { };
};

export default useProjectionData;
