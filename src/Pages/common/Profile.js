/* bookhive/src/components/Profile.js */
import React from "react";

const Profile = () => {
    return (
        <div className="component">
            <h1>User Profile</h1>

            <div className="profile-box">
                <p><strong>Name:</strong> Himanshu Yadav</p>
                <p><strong>Email:</strong> user@example.com</p>
                <p><strong>Uploaded Books:</strong> 7</p>
                <p><strong>Downloads:</strong> 123</p>
            </div>
        </div>
    );
};

export default Profile;
