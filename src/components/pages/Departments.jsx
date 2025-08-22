import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import StatusIndicator from "@/components/molecules/StatusIndicator";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import departmentService from "@/services/api/departmentService";
import patientService from "@/services/api/patientService";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [departmentsData, patientsData] = await Promise.all([
        departmentService.getAll(),
        patientService.getAll()
      ]);
      setDepartments(departmentsData);
      setPatients(patientsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

const getDepartmentPatients = (departmentName) => {
    return patients.filter(patient => patient.current_department_c === departmentName.toLowerCase());
  };

  const movePatientToNextStage = async (patientId, currentDepartment) => {
try {
const patient = patients.find(p => p.Id === patientId);
      if (!patient) return;

      const nextStatus = patient.status_c === "waiting" ? "admitted" : "discharged";
      const updatedPatient = await patientService.update(patientId, {
        ...patient,
        status_c: nextStatus
      });

      setPatients(prev => prev.map(p => p.Id === patientId ? updatedPatient : p));
      toast.success(`Patient moved to ${nextStatus}`);
    } catch (err) {
      toast.error("Failed to update patient status");
    }
  };

  const getDepartmentIcon = (departmentName) => {
    const icons = {
      emergency: "AlertTriangle",
      cardiology: "Heart",
      neurology: "Brain",
      orthopedics: "Bone",
      pediatrics: "Baby",
      general: "Stethoscope"
    };
    return icons[departmentName.toLowerCase()] || "Building2";
  };

  const getDepartmentColor = (departmentName) => {
    const colors = {
      emergency: "error",
      cardiology: "danger",
      neurology: "info",
      orthopedics: "warning",
      pediatrics: "success",
      general: "primary"
    };
    return colors[departmentName.toLowerCase()] || "primary";
  };

  const getWaitTimeColor = (waitTime) => {
    if (waitTime > 60) return "danger";
    if (waitTime > 30) return "warning";
    return "success";
  };

  if (loading) return <Loading variant="skeleton" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Department Management
          </h2>
          <p className="text-slate-600 mt-1">Monitor queues and workflow across departments</p>
        </div>
<div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={loadData}>
            <ApperIcon name="RefreshCw" className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="primary" onClick={() => {
            // This would typically open a modal or navigate to a form
            // For now, we'll use a simple prompt as placeholder
            const name = prompt("Enter department name:");
            if (name) {
              departmentService.create({ Name: name }).then((result) => {
                if (result) {
                  loadData(); // Refresh the departments list
                }
              });
            }
          }}>
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            Create Department
          </Button>
          <Button variant="secondary">
            <ApperIcon name="Settings" className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Department Cards Grid */}
      {departments.length === 0 ? (
        <Empty
          icon="Building2"
          title="No departments found"
          description="No departments are currently configured in the system."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((department, index) => {
const departmentPatients = getDepartmentPatients(department.name);
            const waitingPatients = departmentPatients.filter(p => p.status_c === "waiting");
            const admittedPatients = departmentPatients.filter(p => p.status_c === "admitted");
            
            return (
              <motion.div
                key={department.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => setSelectedDepartment(selectedDepartment === department.Id ? null : department.Id)}
                className="cursor-pointer"
              >
                <Card className={`p-6 transition-all duration-300 ${selectedDepartment === department.Id ? 'ring-2 ring-primary shadow-lg transform scale-[1.02]' : 'hover:shadow-lg hover:-translate-y-1'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 bg-gradient-to-br from-${getDepartmentColor(department.name)}/20 to-${getDepartmentColor(department.name)}/30 rounded-xl flex items-center justify-center`}>
                        <ApperIcon 
                          name={getDepartmentIcon(department.name)} 
                          className={`w-6 h-6 text-${getDepartmentColor(department.name)}`} 
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 capitalize">{department.name}</h3>
                        <p className="text-sm text-slate-500">Department</p>
                      </div>
                    </div>
                    <Badge 
                      variant={getWaitTimeColor(department.averageWaitTime)}
                      size="sm"
                    >
                      {department.averageWaitTime} min
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <p className="text-2xl font-bold text-warning">{waitingPatients.length}</p>
                      <p className="text-xs text-slate-600">Waiting</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <p className="text-2xl font-bold text-info">{admittedPatients.length}</p>
                      <p className="text-xs text-slate-600">Admitted</p>
                    </div>
                  </div>

                  {/* Current Queue */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-600">Current Queue</span>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full bg-${getDepartmentColor(department.name)}`}></div>
                      <span className="text-lg font-bold text-slate-900">{department.currentQueue}</span>
                    </div>
                  </div>

                  {/* Staff */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Active Staff</span>
                    <div className="flex items-center space-x-1">
                      <ApperIcon name="Users" className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-900">{department.activeStaff}</span>
                    </div>
                  </div>

                  {/* Expand indicator */}
                  <div className="flex justify-center mt-4 pt-4 border-t border-slate-100">
                    <ApperIcon 
                      name={selectedDepartment === department.Id ? "ChevronUp" : "ChevronDown"} 
                      className="w-4 h-4 text-slate-400" 
                    />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detailed Department View */}
      {selectedDepartment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6">
            {(() => {
              const department = departments.find(d => d.Id === selectedDepartment);
              const departmentPatients = getDepartmentPatients(department.name);
              
              return (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-slate-900 capitalize">
                      {department.name} - Patient Queue
                    </h3>
                    <Button 
                      variant="ghost" 
                      onClick={() => setSelectedDepartment(null)}
                    >
                      <ApperIcon name="X" className="w-4 h-4" />
                    </Button>
                  </div>

                  {departmentPatients.length === 0 ? (
                    <Empty
                      icon="Users"
                      title="No patients in queue"
                      description={`No patients are currently in the ${department.name} department.`}
                    />
                  ) : (
                    <div className="space-y-4">
                      {departmentPatients.map((patient, index) => (
                        <motion.div
                          key={patient.Id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-200"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center text-primary font-bold text-sm">
                              {index + 1}
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
                                <ApperIcon name="User" className="w-5 h-5 text-slate-600" />
                              </div>
<div>
                                <p className="font-medium text-slate-900">{patient.Name}</p>
<p className="text-sm text-slate-500">ID: {patient.Id} • Age: {patient.age_c}</p>
                              </div>
                            </div>
                          </div>

<div className="flex items-center space-x-4">
                            <StatusIndicator status={patient.status_c} size="sm" />
                            <div className="flex items-center space-x-2">
{patient.status_c === "waiting" && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => movePatientToNextStage(patient.Id, department.name)}
                                >
                                  <ApperIcon name="ArrowRight" className="w-4 h-4 mr-1" />
                                  Admit
                                </Button>
                              )}
                              {patient.status_c === "admitted" && (
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => movePatientToNextStage(patient.Id, department.name)}
                                >
                                  <ApperIcon name="Check" className="w-4 h-4 mr-1" />
                                  Discharge
                                </Button>
                              )}
                              <Button variant="ghost" size="sm">
                                <ApperIcon name="MoreVertical" className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default Departments;