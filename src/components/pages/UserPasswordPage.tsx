import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import SectionTabs from '../dashboard/users/SectionTabs';
import UserPasswordForm from '../dashboard/users/UserPasswordForm';
import { getParameterByName } from '../../utils/url';
import SectionTitleContainer from '../dashboard/elements/SectionTitleContainer';

const UserPasswordPage: FunctionComponent = () => {
    const userId = getParameterByName('userId');
    const [ userName, setUserName ] = useState('');

    const loadUser = useCallback(() => {
        window.ApiClient.getUser(userId).then(function (user) {
            if (!user.Name) {
                throw new Error('Unexpected null user.Name');
            }
            setUserName(user.Name);
        });
    }, [userId]);
    useEffect(() => {
        loadUser();
    }, [loadUser]);

    return (
        <div>
            <div className='content-primary'>
                <div className='verticalSection'>
                    <SectionTitleContainer
                        title={userName}
                        url='https://docs.jellyfin.org/general/server/users/'
                    />
                </div>
                <SectionTabs activeTab='userpassword'/>
                <div className='readOnlyContent'>
                    <UserPasswordForm
                        userId={userId}
                    />
                </div>
            </div>
        </div>
    );
};

export default UserPasswordPage;
