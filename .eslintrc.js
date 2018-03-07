module.exports = {
    "extends": "airbnb",
    "rules": {
        "react/jsx-filename-extension": "off"
    },
    "plugins": [
        "react",
        "jsx-a11y",
        "import"
    ],
    "settings": {
        "react": {
            "pragma": "h"
        }
    },
    "globals": {
        "document": true,
        "window": true
    }
};