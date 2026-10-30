// src/services/locationTypeService.js

const STORAGE_KEY = 'erp_location_type_flow';

export const INITIAL_LOCATION_FLOW = [
  { id: 1, childName: 'Company', parentName: '-' },
  { id: 2, childName: 'Zone', parentName: 'Company' },
  { id: 3, childName: 'Cicle', parentName: 'Zone' },
  { id: 4, childName: 'Division', parentName: 'Cicle' },
  { id: 5, childName: 'Subdivision', parentName: 'Division' },
  { id: 6, childName: 'Aa', parentName: 'Subdivision' }
];

export const locationTypeService = {
  /**
   * Fetch all location flow types
   */
  getLocationTypes: async () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore JSON parse error
    }
    // initialize storage with default flow if empty
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LOCATION_FLOW));
    } catch {}
    return [...INITIAL_LOCATION_FLOW];
  },

  /**
   * Save a new location type flow entry
   */
  addLocationType: async ({ childName, parentName }) => {
    const list = await locationTypeService.getLocationTypes();
    const newId = list.length > 0 ? Math.max(...list.map(item => Number(item.id) || 0)) + 1 : 1;
    const newItem = {
      id: newId,
      childName: childName.trim(),
      parentName: parentName ? parentName.trim() : '-'
    };
    const updated = [...list, newItem];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newItem;
  },

  /**
   * Update an existing location type flow entry
   */
  updateLocationType: async (id, { childName, parentName }) => {
    const list = await locationTypeService.getLocationTypes();
    const updated = list.map(item => {
      if (item.id === id) {
        return {
          ...item,
          childName: childName.trim(),
          parentName: parentName ? parentName.trim() : '-'
        };
      }
      return item;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated.find(item => item.id === id);
  },

  /**
   * Delete a location type flow entry
   */
  deleteLocationType: async (id) => {
    const list = await locationTypeService.getLocationTypes();
    const updated = list.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  },

  /**
   * Reset flow to initial mock data
   */
  resetToDefault: async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LOCATION_FLOW));
    return [...INITIAL_LOCATION_FLOW];
  }
};

export default locationTypeService;

