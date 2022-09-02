import React, { FunctionComponent, useCallback, useEffect, useMemo, useRef } from 'react';
import globalize from '../scripts/globalize';
import LibraryMenu from '../scripts/libraryMenu';
import { clearBackdrop } from '../components/backdrop/backdrop';
import layoutManager from '../components/layoutManager';
import * as mainTabsManager from '../components/maintabsmanager';
import '../elements/emby-tabs/emby-tabs';
import '../elements/emby-button/emby-button';
import '../elements/emby-scroller/emby-scroller';
import Page from '../components/Page';

type IProps = {
    tab?: string;
}

type OnResumeOptions = {
    autoFocus?: boolean;
    refresh?: boolean
}

type ControllerProps = {
    onResume: (
        options: OnResumeOptions
    ) => void;
    refreshed: boolean;
    onPause: () => void;
    destroy: () => void;
}

const Home: FunctionComponent<IProps> = (props: IProps) => {
    const getDefaultTabIndex = () => {
        return 0;
    };

    const tabController = useRef<ControllerProps | null>();
    const currentTabIndex = useRef(parseInt(props.tab || getDefaultTabIndex().toString()));
    const tabControllers = useMemo<ControllerProps[]>(() => [], []);
    const initialTabIndex = useRef<number | null>(currentTabIndex.current);
    const element = useRef<HTMLDivElement>(null);

    const setTitle = () => {
        LibraryMenu.setTitle(null);
    };

    const getTabs = () => {
        return [{
            name: globalize.translate('Home')
        }, {
            name: globalize.translate('Favorites')
        }];
    };

    const getTabContainers = () => {
        return element.current?.querySelectorAll('.tabContent');
    };

    const getTabController = useCallback((index: number) => {
        if (index == null) {
            throw new Error('index cannot be null');
        }

        let depends = '';

        switch (index) {
            case 0:
                depends = 'hometab';
                break;

            case 1:
                depends = 'favorites';
        }

        return import(/* webpackChunkName: "[request]" */ `../controllers/${depends}`).then(({ default: controllerFactory }) => {
            let controller = tabControllers[index];

            if (!controller) {
                const tabContent = element.current?.querySelector(".tabContent[data-index='" + index + "']");
                controller = new controllerFactory(tabContent, props);
                tabControllers[index] = controller;
            }

            return controller;
        });
    }, [props, tabControllers]);

    const onViewDestroy = useCallback(() => {
        if (tabControllers) {
            tabControllers.forEach(function (t) {
                if (t.destroy) {
                    t.destroy();
                }
            });
        }

        tabController.current = null;
        initialTabIndex.current = null;
    }, [tabControllers]);

    const loadTab = useCallback((index: number, previousIndex: number | null) => {
        getTabController(index).then((controller) => {
            const refresh = !controller.refreshed;

            controller.onResume({
                autoFocus: previousIndex == null && layoutManager.tv,
                refresh: refresh
            });

            controller.refreshed = true;
            currentTabIndex.current = index;
            tabController.current = controller;
        });
    }, [getTabController]);

    const onTabChange = useCallback((e: { detail: { selectedTabIndex: string; previousIndex: number | null }; }) => {
        const newIndex = parseInt(e.detail.selectedTabIndex);
        const previousIndex = e.detail.previousIndex;

        const previousTabController = previousIndex == null ? null : tabControllers[previousIndex];
        if (previousTabController && previousTabController.onPause) {
            previousTabController.onPause();
        }

        loadTab(newIndex, previousIndex);
    }, [loadTab, tabControllers]);

    const onResume = useCallback(() => {
        setTitle();
        clearBackdrop();

        const currentTabController = tabController.current;

        if (!currentTabController) {
            mainTabsManager.selectedTabIndex(initialTabIndex.current);
        } else if (currentTabController && currentTabController.onResume) {
            currentTabController.onResume({});
        }
        (document.querySelector('.skinHeader') as HTMLDivElement).classList.add('noHomeButtonHeader');
    }, []);

    const onPause = useCallback(() => {
        const currentTabController = tabController.current;
        if (currentTabController && currentTabController.onPause) {
            currentTabController.onPause();
        }
        (document.querySelector('.skinHeader') as HTMLDivElement).classList.remove('noHomeButtonHeader');
    }, []);

    useEffect(() => {
        mainTabsManager.setTabs(element.current, currentTabIndex.current, getTabs, getTabContainers, null, onTabChange, false);

        onResume();
        return () => {
            onPause();
            onViewDestroy();
        };
    }, [onPause, onResume, onTabChange, onViewDestroy]);

    return (
        <div ref={element}>
            <Page
                id='indexPage'
                className='mainAnimatedPage homePage libraryPage allLibraryPage backdropPage pageWithAbsoluteTabs withTabs'
                isBackButtonEnabled={false}
                backDropType='movie,series,book'
            >
                <div className='tabContent pageTabContent' id='homeTab' data-index='0'>
                    <div className='sections'></div>
                </div>
                <div className='tabContent pageTabContent' id='favoritesTab' data-index='1'>
                    <div className='sections'></div>
                </div>
            </Page>
        </div>
    );
};

export default Home;
