const STORAGE_KEY = "sms_parents";

export function getParents() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

export function saveParents(parents) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parents));
    window.dispatchEvent(new Event("parentsUpdated"));
}

export function addOrUpdateParent(parent) {
    const parents = getParents();

    const index = parents.findIndex(
        (item) => item.phone === parent.phone
    );

    if (index >= 0) {
        parents[index] = {
            ...parents[index],
            ...parent,
        };
    } else {
        parents.push({
            ...parent,
            id: Date.now(),
        });
    }

    saveParents(parents);
    return parents;
}