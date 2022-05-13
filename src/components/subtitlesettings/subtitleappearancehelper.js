/**
 * Subtitle settings visual helper.
 * @module components/subtitleSettings/subtitleAppearanceHelper
 */

function getTextStyles(settings, preview) {
    const list = [];

    switch (settings.textSize || '') {
        case 'smaller':
            list.push({ name: 'font-size', value: '.8em' });
            break;
        case 'small':
            list.push({ name: 'font-size', value: 'inherit' });
            break;
        case 'larger':
            list.push({ name: 'font-size', value: '2em' });
            break;
        case 'extralarge':
            list.push({ name: 'font-size', value: '2.2em' });
            break;
        case 'large':
            list.push({ name: 'font-size', value: '1.72em' });
            break;
        case 'medium':
        default:
            list.push({ name: 'font-size', value: '1.36em' });
            break;
    }

    switch (settings.textWeight || '') {
        case 'bold':
            list.push({ name: 'font-weight', value: 'bold' });
            break;
        case 'normal':
        default:
            list.push({ name: 'font-weight', value: 'normal' });
            break;
    }

    switch (settings.dropShadow || '') {
        case 'raised':
            list.push({ name: 'text-shadow', value: '-1px -1px white, 0px -1px white, -1px 0px white, 1px 1px black, 0px 1px black, 1px 0px black' });
            break;
        case 'depressed':
            list.push({ name: 'text-shadow', value: '1px 1px white, 0px 1px white, 1px 0px white, -1px -1px black, 0px -1px black, -1px 0px black' });
            break;
        case 'uniform':
            list.push({ name: 'text-shadow', value: '-1px 0px #000000, 0px 1px #000000, 1px 0px #000000, 0px -1px #000000' });
            break;
        case 'none':
            list.push({ name: 'text-shadow', value: 'none' });
            break;
        case 'dropshadow':
        default:
            list.push({ name: 'text-shadow', value: '#000000 0px 0px 7px' });
            break;
    }

    const background = settings.textBackground || 'transparent';
    if (background) {
        list.push({ name: 'background-color', value: background });
    }

    const textColor = settings.textColor || '#ffffff';
    if (textColor) {
        list.push({ name: 'color', value: textColor });
    }

    switch (settings.font || '') {
        case 'typewriter':
            list.push({ name: 'font-family', value: '"Courier New",monospace' });
            list.push({ name: 'font-variant', value: 'none' });
            break;
        case 'print':
            list.push({ name: 'font-family', value: 'Georgia,Times New Roman,Arial,Helvetica,serif' });
            list.push({ name: 'font-variant', value: 'none' });
            break;
        case 'console':
            list.push({ name: 'font-family', value: 'Consolas,Lucida Console,Menlo,Monaco,monospace' });
            list.push({ name: 'font-variant', value: 'none' });
            break;
        case 'cursive':
            list.push({ name: 'font-family', value: 'Lucida Handwriting,Brush Script MT,Segoe Script,cursive,Quintessential,system-ui,-apple-system,BlinkMacSystemFont,sans-serif' });
            list.push({ name: 'font-variant', value: 'none' });
            break;
        case 'casual':
            list.push({ name: 'font-family', value: 'Gabriola,Segoe Print,Comic Sans MS,Chalkboard,Short Stack,system-ui,-apple-system,BlinkMacSystemFont,sans-serif' });
            list.push({ name: 'font-variant', value: 'none' });
            break;
        case 'smallcaps':
            list.push({ name: 'font-family', value: 'Copperplate Gothic,Copperplate Gothic Bold,Copperplate,system-ui,-apple-system,BlinkMacSystemFont,sans-serif' });
            list.push({ name: 'font-variant', value: 'small-caps' });
            break;
        default:
            list.push({ name: 'font-family', value: 'inherit' });
            list.push({ name: 'font-variant', value: 'none' });
            break;
    }

    if (!preview) {
        const pos = parseInt(settings.verticalPosition, 10);
        const lineHeight = 1.35; // FIXME: It is better to read this value from element
        const line = Math.abs(pos * lineHeight);
        if (pos < 0) {
            list.push({ name: 'min-height', value: `${line}em` });
            list.push({ name: 'margin-top', value: '' });
        } else {
            list.push({ name: 'min-height', value: '' });
            list.push({ name: 'margin-top', value: `${line}em` });
        }
    }

    return list;
}

function getWindowStyles(settings, preview) {
    const list = [];

    if (!preview) {
        const pos = parseInt(settings.verticalPosition, 10);
        if (pos < 0) {
            list.push({ name: 'top', value: '' });
            list.push({ name: 'bottom', value: '0' });
        } else {
            list.push({ name: 'top', value: '0' });
            list.push({ name: 'bottom', value: '' });
        }
    }

    return list;
}

export function getStyles(settings, preview) {
    return {
        text: getTextStyles(settings, preview),
        window: getWindowStyles(settings, preview)
    };
}

function applyStyleList(styles, elem) {
    for (let i = 0, length = styles.length; i < length; i++) {
        const style = styles[i];

        elem.style[style.name] = style.value;
    }
}

export function applyStyles(elements, appearanceSettings) {
    const styles = getStyles(appearanceSettings, !!elements.preview);

    if (elements.text) {
        applyStyleList(styles.text, elements.text);
    }
    if (elements.window) {
        applyStyleList(styles.window, elements.window);
    }
}
export default {
    getStyles: getStyles,
    applyStyles: applyStyles
};
