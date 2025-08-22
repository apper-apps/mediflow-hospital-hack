import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import SearchBar from "@/components/molecules/SearchBar";
import StatusIndicator from "@/components/molecules/StatusIndicator";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import patientService from "@/services/api/patientService";

const Patients = () => {
const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    emergencyContact: "",
    bloodGroup: "",
    allergies: "",
    currentDepartment: "",
    status: "waiting"
  });

  const departmentOptions = [
    { value: "emergency", label: "Emergency" },
    { value: "cardiology", label: "Cardiology" },
    { value: "neurology", label: "Neurology" },
    { value: "orthopedics", label: "Orthopedics" },
    { value: "pediatrics", label: "Pediatrics" },
    { value: "general", label: "General Medicine" }
  ];

  const statusOptions = [
    { value: "waiting", label: "Waiting" },
    { value: "admitted", label: "Admitted" },
    { value: "discharged", label: "Discharged" },
    { value: "emergency", label: "Emergency" }
  ];
const handleEdit = (patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.Name || "",
      age: patient.age_c?.toString() || "",
      gender: patient.gender_c || "",
      phone: patient.phone_c || "",
      emergencyContact: patient.emergency_contact_c || "",
      bloodGroup: patient.blood_group_c || "",
      allergies: patient.allergies_c || "",
      currentDepartment: patient.current_department_c || "",
      status: patient.status_c || "waiting"
    });
    setShowEditForm(true);
    setDropdownOpen(null);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setShowEditForm(false);
    setEditingPatient(null);
    setFormData({
      name: "",
      age: "",
      gender: "",
      phone: "",
      emergencyContact: "",
      bloodGroup: "",
      allergies: "",
      currentDepartment: "",
      status: "waiting"
    });
  };

  const toggleDropdown = (patientId) => {
    setDropdownOpen(dropdownOpen === patientId ? null : patientId);
    setSelectedPatientId(patientId);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await patientService.getAll();
      setPatients(data);
      setFilteredPatients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleSearch = (searchTerm, filterValue) => {
    let filtered = patients;

    if (searchTerm) {
filtered = filtered.filter(patient =>
        patient.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.Id?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterValue) {
      filtered = filtered.filter(patient => patient.current_department_c === filterValue);
    }

    setFilteredPatients(filtered);
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const patientData = {
        Name: formData.name,
        age_c: parseInt(formData.age),
        gender_c: formData.gender,
        phone_c: formData.phone,
        emergency_contact_c: formData.emergencyContact,
        blood_group_c: formData.bloodGroup,
        allergies_c: formData.allergies,
        current_department_c: formData.currentDepartment,
        status_c: formData.status,
        admission_date_c: editingPatient ? editingPatient.admission_date_c : new Date().toISOString()
      };

      if (editingPatient) {
        // Update existing patient
        const updatedPatient = await patientService.update(editingPatient.Id, patientData);
        const updatedPatients = patients.map(p => 
          p.Id === editingPatient.Id ? updatedPatient : p
        );
        setPatients(updatedPatients);
        setFilteredPatients(updatedPatients);
        toast.success("Patient updated successfully!");
      } else {
        // Create new patient
        const newPatient = await patientService.create(patientData);
        setPatients(prev => [newPatient, ...prev]);
        setFilteredPatients(prev => [newPatient, ...prev]);
        toast.success("Patient registered successfully!");
      }
      
      handleCloseForm();
    } catch (err) {
      toast.error(editingPatient ? "Failed to update patient" : "Failed to register patient");
    }
  };

const handleStatusUpdate = async (patientId, newStatus) => {
    try {
const patient = patients.find(p => p.Id === patientId);
      const updatedPatient = await patientService.update(patientId, { ...patient, status_c: newStatus });
      
      const updatedPatients = patients.map(p => 
        p.Id === patientId ? updatedPatient : p
      );
      setPatients(updatedPatients);
      setFilteredPatients(updatedPatients);
      toast.success(`Patient status updated to ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update patient status");
    }
  };

  const handleDelete = async (patientId) => {
    try {
      const patient = patients.find(p => p.Id === patientId);
      const patientName = patient?.Name || 'this patient';
      
      if (confirm(`Are you sure you want to delete ${patientName}? This action cannot be undone.`)) {
        const success = await patientService.delete(patientId);
        
        if (success) {
          // Remove the deleted patient from both lists immediately
          const updatedPatients = patients.filter(p => p.Id !== patientId);
          setPatients(updatedPatients);
          setFilteredPatients(updatedPatients);
        }
      }
    } catch (err) {
      toast.error("Failed to delete patient");
    }
  };

  if (loading) return <Loading variant="skeleton" />;
  if (error) return <Error message={error} onRetry={loadPatients} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Patient Management
          </h2>
          <p className="text-slate-600 mt-1">Register and manage patient records</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          variant="primary"
          className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg"
        >
          <ApperIcon name="UserPlus" className="w-4 h-4 mr-2" />
          Add Patient
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search patients by name or ID..."
          showFilter={true}
          filterOptions={departmentOptions}
          onFilterChange={(filter) => handleSearch("", filter)}
        />
      </Card>

      {/* Add Patient Form */}
{(showAddForm || showEditForm) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
        >
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-900">
                  {editingPatient ? 'Edit Patient' : 'Add New Patient'}
                </h3>
                <Button variant="ghost" onClick={handleCloseForm}>
                  <ApperIcon name="X" className="w-5 h-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                  <Input
                    label="Age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    required
                  />
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                      className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <Input
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                  <Input
                    label="Emergency Contact"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    required
                  />
                  <Input
                    label="Blood Group"
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData(prev => ({ ...prev, bloodGroup: e.target.value }))}
                    placeholder="e.g., A+, O-, AB+"
                    required
                  />
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                    <select
                      value={formData.currentDepartment}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentDepartment: e.target.value }))}
                      className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    >
                      <option value="">Select Department</option>
                      {departmentOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Allergies (comma-separated)</label>
                  <textarea
                    value={formData.allergies}
                    onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
                    placeholder="e.g., Penicillin, Peanuts, Latex"
                    className="flex w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px]"
                  />
                </div>

                <div className="flex gap-3 pt-4">
<Button type="submit" variant="primary" className="flex-1">
                    {editingPatient ? 'Update Patient' : 'Register Patient'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={handleCloseForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Patients List */}
      {filteredPatients.length === 0 ? (
        <Empty
          icon="Users"
          title="No patients found"
          description="No patients match your current search criteria."
          actionLabel="Add First Patient"
          onAction={() => setShowAddForm(true)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPatients.map((patient, index) => (
            <motion.div
key={patient.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center">
                      <ApperIcon name="User" className="w-6 h-6 text-primary" />
                    </div>
                    <div>
<h3 className="font-semibold text-slate-900">{patient.Name}</h3>
<p className="text-sm text-slate-500">ID: {patient.Id}</p>
                    </div>
                  </div>
                  <StatusIndicator status={patient.status_c} size="sm" />
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Age:</span>
                      <span className="ml-2 font-medium text-slate-900">{patient.age_c}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Gender:</span>
                      <span className="ml-2 font-medium text-slate-900 capitalize">{patient.gender_c}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Blood:</span>
                      <span className="ml-2 font-medium text-slate-900">{patient.blood_group_c}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Phone:</span>
                      <span className="ml-2 font-medium text-slate-900">{patient.phone_c}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 text-sm">Department:</span>
                    <Badge variant="primary" size="sm" className="ml-2 capitalize">
                      {patient.current_department_c}
                    </Badge>
                  </div>

{patient.allergies_c && patient.allergies_c.length > 0 && (
                    <div>
                      <span className="text-slate-500 text-sm">Allergies:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {patient.allergies_c.split(',').map((allergy, idx) => (
                          <Badge key={idx} variant="warning" size="sm">
                            {allergy.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
<select
                      value={patient.status_c}
onChange={(e) => handleStatusUpdate(patient.Id, e.target.value)}
                      className="flex-1 h-8 px-2 py-1 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:border-primary focus:outline-none"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
<div className="relative dropdown-container">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleDropdown(patient.Id)}
                      >
                        <ApperIcon name="MoreVertical" className="w-4 h-4" />
                      </Button>
                      
                      {dropdownOpen === patient.Id && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                          <button
                            onClick={() => handleEdit(patient)}
                            className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <ApperIcon name="Edit" className="w-3 h-3" />
                            Edit
                          </button>
                          <button
onClick={() => {
                              handleDelete(patient.Id);
                              setDropdownOpen(null);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <ApperIcon name="Trash2" className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Patients;