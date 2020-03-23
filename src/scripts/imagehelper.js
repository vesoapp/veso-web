define(["browser"], function (browser) {
    "use strict";

    function getDeviceIcon(device) {
        var baseUrl = "assets/img/devices/";
        switch (device.AppName || device.Client) {
            case "Samsung Smart TV":
                return baseUrl + "samsung.svg";
            case "Xbox One":
                return baseUrl + "xbox.svg";
            case "Sony PS4":
                return baseUrl + "playstation.svg";
            case "Kodi":
                return baseUrl + "kodi.svg";
            case "Jellyfin Android":
                return baseUrl + "android.svg";
            case "Jellyfin Web":
                switch (device.Name || device.DeviceName) {
                    case "Opera":
                    case "Opera TV":
                    case "Opera Android":
                        return baseUrl + "opera.svg";
                    case "Chrome":
                    case "Chrome Android":
                        return baseUrl + "chrome.svg";
                    case "Firefox":
                    case "Firefox Android":
                        return baseUrl + "firefox.svg";
                    case "Safari":
                    case "Safari iPad":
                    case "Safari iPhone":
                        return baseUrl + "safari.svg";
                    case "Edge":
                        return baseUrl + "edge.svg";
                    case "Internet Explorer":
                        return baseUrl + "msie.svg";
                    default:
                        return baseUrl + "html5.svg";
                }
            default:
                return baseUrl + "other.svg";
        }
    }

    function getLibraryIcon(library) {
        switch (library) {
            case "movies":
                return "video_library";
            case "music":
                return "library_music";
            case "photos":
                return "photo_library";
            case "livetv":
                return "live_tv";
            case "tvshows":
                return "tv";
            case "trailers":
                return "local_movies";
            case "homevideos":
                return "photo_library";
            case "musicvideos":
                return "music_video";
            case "books":
                return "library_books";
            case "channels":
                return "videocam";
            case "playlists":
                return "view_list";
            default:
                return "folder";
        }
    }

    return {
        getDeviceIcon: getDeviceIcon,
        getLibraryIcon: getLibraryIcon
    };
});
