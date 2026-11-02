// src/pages/Master/LocationMasterView.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useERPStore } from '../../store/useERPStore';
import { locationService } from '../../services/locationService';
import {
  PageHeader,
  Card,
  Button
} from '../../components/ui/index';
import {
  MapPin,
  GitFork,
  Building2,
  User,
  Phone,
  Mail,
  Home,
  Plus,
  RotateCcw,
  AlertCircle,
  ShieldCheck,
  Globe,
  Layers
} from 'lucide-react';

// Form Field Container with theme label & error display
function Field({ label, error, children, required, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <span className="text-[11px] text-slate-400 dark:text-slate-500">{hint}</span>
      )}
      {error && (
        <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />{error}
        </span>
      )}
    </div>
  );
}

// Section Header matching portal design system
function SectionHeader({ icon: Icon, iconColor, title, subtitle, badge }) {
  return (
    <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconColor} shadow-xs`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {badge && <div>{badge}</div>}
    </div>
  );
}

// Theme Input Class helper
const inputCls = (err) =>
  `w-full px-3 py-2.5 text-sm rounded-xl border ${
    err
      ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500'
      : 'border-slate-200 dark:border-slate-700/80 focus:ring-indigo-500/20 focus:border-indigo-500'
  } bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all duration-200 font-medium`;

// Theme Select Class helper
const selectCls = (err, disabled) =>
  `w-full px-3 py-2.5 text-sm rounded-xl border ${
    err
      ? 'border-rose-400 focus:ring-rose-500'
      : 'border-slate-200 dark:border-slate-700/80 focus:ring-indigo-500/20 focus:border-indigo-500'
  } ${
    disabled
      ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-75'
      : 'bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white cursor-pointer'
  } focus:outline-hidden focus:ring-2 transition-all duration-200 font-medium`;

export default function LocationMasterView() {
  const showToast = useERPStore((state) => state.showToast);
  const currentUser = useERPStore((state) => state.user);
  const userName = currentUser?.loginName || currentUser?.name || currentUser?.EmployeeId || '';

  // Extract session username
  const getSessionUserName = () => {
    try {
      const raw = localStorage.getItem('session') || sessionStorage.getItem('session');
      if (raw) {
        const s = JSON.parse(raw);
        const user = s?.data?.user || s?.user || s;
        return user?.loginName || user?.LoginName || user?.EmployeeId || user?.userName || user?.name || '';
      }
      const u = JSON.parse(localStorage.getItem('erp_user') || '{}');
      return u?.loginName || u?.LoginName || u?.EmployeeId || u?.name || '';
    } catch {
      return '';
    }
  };

  // State
  const [locationTypes, setLocationTypes] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [parentLocationsList, setParentLocationsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingParentLocations, setLoadingParentLocations] = useState(false);

  // Form Inputs
  const [locationTypeMasterId, setLocationTypeMasterId] = useState('');
  const [companyMasterId, setCompanyMasterId] = useState('');
  const [parentLocationMasterId, setParentLocationMasterId] = useState('');
  const [locationName, setLocationName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [emailId, setEmailId] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState({});

  // Load Location Types on Mount
  useEffect(() => {
    fetchLocationTypes();
  }, []);

  // 1. Fetch Location Types dropdown via /verp-service/locationMaster/getLocationTypes with { flagId: 1 }
  const fetchLocationTypes = async () => {
    try {
      const res = await locationService.getLocationTypes();
      const raw = res?.data?.data !== undefined ? res?.data?.data : (res?.data !== undefined ? res?.data : res);
      const list = Array.isArray(raw)
        ? raw
        : (raw && typeof raw === 'object' && Object.keys(raw).length > 0 ? [raw] : []);
      setLocationTypes(list);
    } catch (err) {
      console.error('Failed to load location types via /verp-service/locationMaster/getLocationTypes:', err);
      setLocationTypes([]);
    }
  };

  // 3. Fetch Company Master dropdown for selected Location Type
  // Route: /verp-service/locationMaster/getParentLocationTypes with { flagId: 2, LocationTypeMasterId }
  const fetchCompaniesForLocationType = async (locTypeId) => {
    if (!locTypeId) {
      setCompanies([]);
      return;
    }
    setLoadingCompanies(true);
    try {
      const res = await locationService.getParentLocationTypes({
        LocationTypeMasterId: Number(locTypeId)
      });
      const raw = res?.data?.data !== undefined ? res?.data?.data : (res?.data !== undefined ? res?.data : res);
      const list = Array.isArray(raw)
        ? raw
        : (raw && typeof raw === 'object' && Object.keys(raw).length > 0 ? [raw] : []);
      setCompanies(list);
    } catch (err) {
      console.error('Failed to load companies via /verp-service/locationMaster/getParentLocationTypes:', err);
      setCompanies([]);
    } finally {
      setLoadingCompanies(false);
    }
  };

  // 4. Fetch Parent Location Master dropdown for selected Location Type and Company Master
  // Route: /verp-service/locationMaster/getParentLocations with { flagId: 3, LocationTypeMasterId, CompanyMasterId }
  const fetchParentLocationsForCompany = async (locTypeId, compId) => {
    if (!locTypeId || !compId) {
      setParentLocationsList([]);
      return;
    }
    setLoadingParentLocations(true);
    try {
      const res = await locationService.getParentLocations({
        LocationTypeMasterId: Number(locTypeId),
        CompanyMasterId: Number(compId)
      });
      const raw = res?.data?.data !== undefined ? res?.data?.data : (res?.data !== undefined ? res?.data : res);
      const list = Array.isArray(raw)
        ? raw
        : (raw && typeof raw === 'object' && Object.keys(raw).length > 0 ? [raw] : []);
      setParentLocationsList(list);
    } catch (err) {
      console.error('Failed to load parent locations via /verp-service/locationMaster/getParentLocations:', err);
      setParentLocationsList([]);
    } finally {
      setLoadingParentLocations(false);
    }
  };

  // Selected Location Type Object
  const selectedLocationTypeObj = useMemo(() => {
    if (!locationTypeMasterId) return null;
    return locationTypes.find(
      t => String(t.LocationTypeMasterId ?? t.LocationTypeId ?? t.id ?? t.value) === String(locationTypeMasterId)
    );
  }, [locationTypes, locationTypeMasterId]);

  // Is the selected location type the Root/Parent one?
  // When ParentTypeId is null or 0 or ParentLocationTypeName is '-' or null
  const isParentType = useMemo(() => {
    if (!selectedLocationTypeObj) return false;
    const parentId = selectedLocationTypeObj.ParentTypeId ?? selectedLocationTypeObj.ParentLocationTypeId;
    const parentName = selectedLocationTypeObj.ParentLocationTypeName ?? selectedLocationTypeObj.ParentName;
    return (
      parentId === null ||
      parentId === undefined ||
      parentId === 0 ||
      parentId === '' ||
      parentName === '-' ||
      parentName === null
    );
  }, [selectedLocationTypeObj]);

  // If a location type is selected, should CompanyMaster and ParentLocationMaster dropdowns be shown?
  // User Requirement:
  // "if this is the parent one CompanyMaster,ParentLocationMaster this two dropdown should not come
  // if that is not a parent then this two dropdowns should visible"
  const showDependentDropdowns = Boolean(locationTypeMasterId) && !isParentType;

  // Available parent locations fetched via /verp-service/locationMaster/getParentLocations
  const availableParentLocations = useMemo(() => {
    return parentLocationsList.map(loc => ({
      id: loc.LocationMasterId ?? loc.LocationId ?? loc.id ?? loc.value,
      name: loc.LocationName ?? loc.ParentLocationName ?? loc.name ?? loc.label,
      typeName: loc.LocationTypeName ?? loc.LocationTypeMasterName ?? ''
    }));
  }, [parentLocationsList]);

  // Validation
  const validate = () => {
    const errs = {};

    if (!locationTypeMasterId) {
      errs.locationTypeMasterId = 'Please select a Location Type';
    }

    if (showDependentDropdowns) {
      if (!companyMasterId) {
        errs.companyMasterId = 'Please select a Company';
      }
      if (!parentLocationMasterId) {
        errs.parentLocationMasterId = 'Please select a Parent Location';
      }
    }

    const trimmedName = locationName.trim();
    if (!trimmedName) {
      errs.locationName = 'Location Name is required';
    } else if (trimmedName.length < 2) {
      errs.locationName = 'Location Name must be at least 2 characters';
    } else if (trimmedName.length > 100) {
      errs.locationName = 'Location Name must not exceed 100 characters';
    }

    if (contactNumber.trim()) {
      const cleanNum = contactNumber.trim().replace(/\D/g, '');
      if (cleanNum.length < 7 || cleanNum.length > 15) {
        errs.contactNumber = 'Enter a valid contact number (7-15 digits)';
      }
    }

    if (emailId.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailId.trim())) {
        errs.emailId = 'Enter a valid email address';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const sessionUser = getSessionUserName() || userName || 'Admin';

      // Exact payload required by user:
      // {
      //   "flagId": 4,
      //   "CompanyMasterId": ...,
      //   "LocationTypeMasterId": ...,
      //   "ParentLocationMasterId": ...,
      //   "LocationName": "...",
      //   "ContactPerson": "...",
      //   "ContactNumber": "...",
      //   "EmailId": "...",
      //   "Address": "...",
      //   "CreatedByUserName": "..."
      // }
      const payload = {
        flagId: 4,
        CompanyMasterId: isParentType || !showDependentDropdowns ? null : (companyMasterId ? Number(companyMasterId) : null),
        LocationTypeMasterId: Number(locationTypeMasterId),
        ParentLocationMasterId: isParentType || !showDependentDropdowns ? null : (parentLocationMasterId ? Number(parentLocationMasterId) : null),
        LocationName: locationName.trim(),
        ContactPerson: contactPerson.trim(),
        ContactNumber: contactNumber.trim(),
        EmailId: emailId.trim(),
        Address: address.trim(),
        CreatedByUserName: sessionUser
      };

      await locationService.addLocationMaster(payload);
      showToast('Location added successfully!', 'success');
      handleReset();
    } catch (err) {
      console.error('Failed to add Location:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to add Location', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Reset Handler
  const handleReset = () => {
    setLocationTypeMasterId('');
    setCompanyMasterId('');
    setParentLocationMasterId('');
    setLocationName('');
    setContactPerson('');
    setContactNumber('');
    setEmailId('');
    setAddress('');
    setErrors({});
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Page Header */}
      <PageHeader
        title="Location Master"
        description="Register and manage physical locations, regional facilities, branches, and organizational jurisdiction units."
        breadcrumbs={[
          { label: 'Master', href: '/master/companies' },
          { label: 'Location Master' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={handleReset}
              className="cursor-pointer"
            >
              Reset Form
            </Button>
          </div>
        }
      />

      {/* 2. Top Card: Location Registration Form */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-6 sm:p-7">
        <SectionHeader
          icon={MapPin}
          iconColor="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
          title="Location Registration"
          subtitle="Select location level first to configure hierarchical dependencies, parent linkage, and regional details."
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Hierarchy & Relations */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              1. Hierarchy & Classification
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {/* Field 1: Location Type (Selected First) */}
              <Field
                label="Location Type"
                required
                error={errors.locationTypeMasterId}
                hint="Step 1: Choose level first (e.g. Country, State, District, Branch)"
              >
                <div className="relative">
                  <GitFork className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select
                    value={locationTypeMasterId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLocationTypeMasterId(val);
                      // Clear errors
                      if (errors.locationTypeMasterId) {
                        setErrors(prev => ({ ...prev, locationTypeMasterId: null }));
                      }
                      // Reset dependent fields when location type changes
                      setCompanyMasterId('');
                      setParentLocationMasterId('');
                      setParentLocationsList([]);

                      // Check if non-parent type selected
                      const chosen = locationTypes.find(
                        t => String(t.LocationTypeMasterId ?? t.LocationTypeId ?? t.id ?? t.value) === String(val)
                      );
                      const parentId = chosen?.ParentTypeId ?? chosen?.ParentLocationTypeId;
                      const parentName = chosen?.ParentLocationTypeName ?? chosen?.ParentName;
                      const isParent = !chosen || parentId === null || parentId === undefined || parentId === 0 || parentId === '' || parentName === '-' || parentName === null;

                      if (val && !isParent) {
                        fetchCompaniesForLocationType(val);
                      } else {
                        setCompanies([]);
                      }
                    }}
                    className={`${selectCls(errors.locationTypeMasterId, false)} pl-9.5`}
                  >
                    <option value="">-- Select Location Type First --</option>
                    {locationTypes.map((type) => {
                      const id = type.LocationTypeMasterId ?? type.LocationTypeId ?? type.id ?? type.value;
                      const name = type.LocationTypeMasterName ?? type.LocationTypeName ?? type.name ?? type.label;
                      const parentId = type.ParentTypeId ?? type.ParentLocationTypeId;
                      const isRoot = !parentId && (!type.ParentLocationTypeName || type.ParentLocationTypeName === '-');
                      return (
                        <option key={id} value={id}>
                          {name} {isRoot ? '(Root Authority)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </Field>

              {/* Conditional Info Banner if Root/Parent Type */}
              {Boolean(locationTypeMasterId) && isParentType && (
                <div className="sm:col-span-2 flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold">Root Parent Level Detected ({selectedLocationTypeObj?.LocationTypeMasterName || 'Parent'})</p>
                    <p className="text-emerald-700 dark:text-emerald-400 mt-0.5">
                      Company Master and Parent Location dropdowns are omitted for top-level root entities.
                    </p>
                  </div>
                </div>
              )}

              {/* Field 2: Company Master (Visible ONLY when not a parent type) */}
              {showDependentDropdowns && (
                <Field
                  label="Company Master"
                  required
                  error={errors.companyMasterId}
                  hint="Select operating company entity"
                >
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select
                      value={companyMasterId}
                      onChange={(e) => {
                        const compVal = e.target.value;
                        setCompanyMasterId(compVal);
                        if (errors.companyMasterId) {
                          setErrors(prev => ({ ...prev, companyMasterId: null }));
                        }
                        setParentLocationMasterId('');
                        if (locationTypeMasterId && compVal) {
                          fetchParentLocationsForCompany(locationTypeMasterId, compVal);
                        } else {
                          setParentLocationsList([]);
                        }
                      }}
                      className={`${selectCls(errors.companyMasterId, loadingCompanies)} pl-9.5`}
                    >
                      <option value="">
                        {loadingCompanies ? '-- Loading Companies... --' : '-- Select Company Master --'}
                      </option>
                      {companies.map((comp, idx) => {
                        const id = comp.CompanyMasterId ?? comp.CompanyId ?? comp.ParentLocationTypeId ?? comp.ParentTypeId ?? comp.LocationTypeMasterId ?? comp.id ?? comp.value;
                        const name = comp.CompanyName ?? comp.companyName ?? comp.ParentLocationTypeName ?? comp.LocationTypeMasterName ?? comp.name ?? comp.label;
                        const code = comp.CompanyCode ?? comp.companyCode ?? comp.code;
                        return (
                          <option key={id ?? idx} value={id}>
                            {name} {code ? `(${code})` : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </Field>
              )}

              {/* Field 3: Parent Location Master (Visible ONLY when not a parent type) */}
              {showDependentDropdowns && (
                <Field
                  label="Parent Location Master"
                  required
                  error={errors.parentLocationMasterId}
                  hint="Immediate geographical/organizational parent"
                >
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select
                      value={parentLocationMasterId}
                      disabled={!companyMasterId || loadingParentLocations}
                      onChange={(e) => {
                        setParentLocationMasterId(e.target.value);
                        if (errors.parentLocationMasterId) {
                          setErrors(prev => ({ ...prev, parentLocationMasterId: null }));
                        }
                      }}
                      className={`${selectCls(errors.parentLocationMasterId, !companyMasterId || loadingParentLocations)} pl-9.5`}
                    >
                      <option value="">
                        {!companyMasterId
                          ? '-- Select Company Master First --'
                          : loadingParentLocations
                          ? '-- Loading Parent Locations... --'
                          : '-- Select Parent Location --'}
                      </option>
                      {availableParentLocations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name} {loc.typeName ? `(${loc.typeName})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </Field>
              )}
            </div>
          </div>

          {/* Section 2: Location Information & Coordinates */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
              2. Location Details & Contact Channels
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {/* Location Name */}
              <div className="sm:col-span-2">
                <Field label="Location Name" required error={errors.locationName}>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g. India, Karnataka, Bangalore Branch"
                      value={locationName}
                      onChange={(e) => {
                        setLocationName(e.target.value);
                        if (errors.locationName) setErrors(prev => ({ ...prev, locationName: null }));
                      }}
                      className={`${inputCls(errors.locationName)} pl-9.5`}
                    />
                  </div>
                </Field>
              </div>

              {/* Contact Person */}
              <Field label="Contact Person" error={errors.contactPerson}>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={contactPerson}
                    onChange={(e) => {
                      setContactPerson(e.target.value);
                      if (errors.contactPerson) setErrors(prev => ({ ...prev, contactPerson: null }));
                    }}
                    className={`${inputCls(errors.contactPerson)} pl-9.5`}
                  />
                </div>
              </Field>

              {/* Contact Number */}
              <Field label="Contact Number" error={errors.contactNumber}>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. 9845012345"
                    value={contactNumber}
                    onChange={(e) => {
                      setContactNumber(e.target.value);
                      if (errors.contactNumber) setErrors(prev => ({ ...prev, contactNumber: null }));
                    }}
                    className={`${inputCls(errors.contactNumber)} pl-9.5`}
                  />
                </div>
              </Field>

              {/* Email ID */}
              <div className="sm:col-span-2">
                <Field label="Email ID" error={errors.emailId}>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="email"
                      placeholder="e.g. branch.ops@company.com"
                      value={emailId}
                      onChange={(e) => {
                        setEmailId(e.target.value);
                        if (errors.emailId) setErrors(prev => ({ ...prev, emailId: null }));
                      }}
                      className={`${inputCls(errors.emailId)} pl-9.5`}
                    />
                  </div>
                </Field>
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <Field label="Address" error={errors.address}>
                  <div className="relative">
                    <Home className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    <textarea
                      rows={2}
                      placeholder="e.g. #102 Tech Park, Outer Ring Road, Bangalore"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (errors.address) setErrors(prev => ({ ...prev, address: null }));
                      }}
                      className={`${inputCls(errors.address)} pl-9.5 resize-none py-2`}
                    />
                  </div>
                </Field>
              </div>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={Plus}
              disabled={loading}
              className="px-6 cursor-pointer"
            >
              {loading ? 'Adding Location...' : 'Add Location'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={handleReset}
              className="cursor-pointer"
            >
              Clear Fields
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

