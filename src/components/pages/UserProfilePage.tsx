import { ImageType, UserDto } from '@thornbill/jellyfin-sdk/dist/generated-client';
import React, { FunctionComponent, useEffect, useState, useRef, useCallback } from 'react';

import Dashboard from '../../utils/dashboard';
import globalize from '../../scripts/globalize';
import LibraryMenu from '../../scripts/libraryMenu';
import { appHost } from '../apphost';
import confirm from '../confirm/confirm';
import ButtonElement from '../dashboard/users/ButtonElement';
import UserPasswordForm from '../dashboard/users/UserPasswordForm';
import loading from '../loading/loading';
import toast from '../toast/toast';

type IProps = {
    userId: string;
}

const UserProfilePage: FunctionComponent<IProps> = ({userId}: IProps) => {
    const [ userName, setUserName ] = useState('');

    const element = useRef<HTMLDivElement>(null);

    const reloadUser = useCallback(() => {
        const page = element.current;

        if (!page) {
            console.error('Unexpected null reference');
            return;
        }

        loading.show();
        window.ApiClient.getUser(userId).then(function (user) {
            if (!user.Name) {
                throw new Error('Unexpected null user.Name');
            }

            if (!user.Id) {
                throw new Error('Unexpected null user.Id');
            }

            setUserName(user.Name);
            LibraryMenu.setTitle(user.Name);

            let imageUrl = 'assets/img/avatar.png';
            if (user.PrimaryImageTag) {
                imageUrl = window.ApiClient.getUserImageUrl(user.Id, {
                    tag: user.PrimaryImageTag,
                    type: 'Primary'
                });
            }
            const userImage = (page.querySelector('#image') as HTMLDivElement);
            userImage.style.backgroundImage = 'url(' + imageUrl + ')';

            Dashboard.getCurrentUser().then(function (loggedInUser: UserDto) {
                if (!user.Policy) {
                    throw new Error('Unexpected null user.Policy');
                }

                if (user.PrimaryImageTag) {
                    (page.querySelector('.btnAddImage') as HTMLButtonElement).classList.add('hide');
                    (page.querySelector('.btnDeleteImage') as HTMLButtonElement).classList.remove('hide');
                } else if (appHost.supports('fileinput') && (loggedInUser?.Policy?.IsAdministrator || user.Policy.EnableUserPreferenceAccess)) {
                    (page.querySelector('.btnDeleteImage') as HTMLButtonElement).classList.add('hide');
                    (page.querySelector('.btnAddImage') as HTMLButtonElement).classList.remove('hide');
                }
            });
            loading.hide();
        });
    }, [userId]);

    useEffect(() => {
        const page = element.current;

        if (!page) {
            console.error('Unexpected null reference');
            return;
        }

        reloadUser();

        const onFileReaderError = (evt: ProgressEvent<FileReader>) => {
            loading.hide();
            switch (evt.target?.error?.code) {
                case DOMException.NOT_FOUND_ERR:
                    toast(globalize.translate('FileNotFound'));
                    break;
                case DOMException.ABORT_ERR:
                    onFileReaderAbort();
                    break;
                default:
                    toast(globalize.translate('FileReadError'));
            }
        };

        const onFileReaderAbort = () => {
            loading.hide();
            toast(globalize.translate('FileReadCancelled'));
        };

        const setFiles = (evt: Event) => {
            const userImage = (page.querySelector('#image') as HTMLDivElement);
            const target = evt.target as HTMLInputElement;
            const file = (target.files as FileList)[0];

            if (!file || !file.type.match('image.*')) {
                return false;
            }

            const reader: FileReader = new FileReader();
            reader.onerror = onFileReaderError;
            reader.onabort = onFileReaderAbort;
            reader.onload = () => {
                userImage.style.backgroundImage = 'url(' + reader.result + ')';
                window.ApiClient.uploadUserImage(userId, ImageType.Primary, file).then(function () {
                    loading.hide();
                    reloadUser();
                });
            };

            reader.readAsDataURL(file);
        };

        (page.querySelector('.btnDeleteImage') as HTMLButtonElement).addEventListener('click', function () {
            confirm(
                globalize.translate('DeleteImageConfirmation'),
                globalize.translate('DeleteImage')
            ).then(function () {
                loading.show();
                window.ApiClient.deleteUserImage(userId, ImageType.Primary).then(function () {
                    loading.hide();
                    reloadUser();
                });
            });
        });

        (page.querySelector('.btnAddImage') as HTMLButtonElement).addEventListener('click', function () {
            const uploadImage = page.querySelector('#uploadImage') as HTMLInputElement;
            uploadImage.value = '';
            uploadImage.click();
        });

        (page.querySelector('#uploadImage') as HTMLInputElement).addEventListener('change', function (evt: Event) {
            setFiles(evt);
        });
    }, [reloadUser, userId]);

    return (
        <div ref={element}>
            <div className='padded-left padded-right padded-bottom-page'>
                <div
                    className='readOnlyContent'
                    style={{margin: '0 auto', marginBottom: '1.8em', padding: '0 1em', display: 'flex', flexDirection: 'row', alignItems: 'center'}}
                >
                    <div
                        style={{position: 'relative', display: 'inline-block', maxWidth: 200 }}
                    >
                        <input
                            id='uploadImage'
                            type='file'
                            accept='image/*'
                            style={{position: 'absolute', right: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer'}}
                        />
                        <div
                            id='image'
                            style={{width: 200, height: 200, backgroundRepeat: 'no-repeat', backgroundPosition: 'center', borderRadius: '100%', backgroundSize: 'cover'}}
                        />
                    </div>
                    <div style={{verticalAlign: 'top', margin: '1em 2em', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        <h2 className='username' style={{margin: 0, fontSize: 'xx-large'}}>
                            {userName}
                        </h2>
                        <br />
                        <ButtonElement
                            type='button'
                            className='raised btnAddImage hide'
                            title='ButtonAddImage'
                        />
                        <ButtonElement
                            type='button'
                            className='raised btnDeleteImage hide'
                            title='DeleteImage'
                        />
                    </div>
                </div>
                <UserPasswordForm
                    userId={userId}
                />
            </div>
        </div>
    );
};

export default UserProfilePage;
