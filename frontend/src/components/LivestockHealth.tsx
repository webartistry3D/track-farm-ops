import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { 
  Search, Plus, AlertTriangle, TrendingUp, Eye, 
  Activity, Stethoscope, PawPrint, ClipboardList, Syringe, Shield, AlertCircle
} from 'lucide-react';

interface Livestock {
  id: string;
  name: string;
  tagId: string;
  species: 'cattle' | 'sheep' | 'goat' | 'pig' | 'poultry' | 'horse' | 'other';
  breed: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  weight: number;
  location: string;
  healthStatus: 'healthy' | 'sick' | 'quarantine' | 'recovery' | 'critical';
  lastCheckup: string;
  notes: string;
}

interface HealthRecord {
  id: string;
  livestockId: string;
  recordType: 'vaccination' | 'treatment' | 'checkup' | 'surgery' | 'lab_test' | 'other';
  date: string;
  veterinarian: string;
  diagnosis: string;
  treatment: string;
  medications: string;
  notes: string;
  followUpDate?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface Vaccination {
  id: string;
  livestockId: string;
  vaccineName: string;
  vaccineType: string;
  administrationDate: string;
  nextDueDate: string;
  veterinarian: string;
  batchNumber: string;
  notes: string;
}

const LivestockHealth = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Scroll to top when navigating to Livestock Health page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  if (!user) {
    return <div>Please log in to access livestock health management.</div>;
  }

  // Role-based access control
  const isVeterinarian = user.role === 'VETERINARIAN';
  const isOwner = user.role === 'OWNER' || user.role === 'MANAGER' || user.role === 'ACCOUNTANT' || user.role === 'INVENTORY';

  if (!isVeterinarian && !isOwner) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-yellow-900 mb-2">Access Restricted</h3>
        <p className="text-yellow-700">
          Livestock health management is only available to veterinarians, owners, managers, accountants, and inventory managers.
        </p>
      </div>
    );
  }

  // State management
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('all');
  const [selectedHealthStatus, setSelectedHealthStatus] = useState('all');
  const [activeTab, setActiveTab] = useState<'livestock' | 'healthRecords' | 'vaccinations'>('livestock');

  // Modal states
  const [showAddLivestockModal, setShowAddLivestockModal] = useState(false);
  const [showAddHealthRecordModal, setShowAddHealthRecordModal] = useState(false);
  const [showAddVaccinationModal, setShowAddVaccinationModal] = useState(false);

  // Form states
  const [newLivestock, setNewLivestock] = useState({
    name: '',
    tagId: '',
    species: 'cattle' as const,
    breed: '',
    dateOfBirth: '',
    gender: 'male' as const,
    weight: '',
    location: '',
    healthStatus: 'healthy' as const,
    notes: ''
  });

  const [newHealthRecord, setNewHealthRecord] = useState({
    livestockId: '',
    recordType: 'checkup' as const,
    date: new Date().toISOString().split('T')[0],
    veterinarian: '',
    diagnosis: '',
    treatment: '',
    medications: '',
    notes: '',
    followUpDate: '',
    status: 'scheduled' as const
  });

  const [newVaccination, setNewVaccination] = useState({
    livestockId: '',
    vaccineName: '',
    vaccineType: '',
    administrationDate: new Date().toISOString().split('T')[0],
    nextDueDate: '',
    veterinarian: '',
    batchNumber: '',
    notes: ''
  });

  // Fetch livestock data
  const fetchLivestock = async () => {
    try {
      setLoading(true);
      const response = await api.get('/livestock');
      setLivestock(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch livestock:', err);
      setLivestock([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch health records
  const fetchHealthRecords = async () => {
    try {
      const response = await api.get('/livestock/health-records');
      setHealthRecords(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch health records:', err);
      setHealthRecords([]);
    }
  };

  // Fetch vaccinations
  const fetchVaccinations = async () => {
    try {
      const response = await api.get('/livestock/vaccinations');
      setVaccinations(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch vaccinations:', err);
      setVaccinations([]);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchLivestock();
    fetchHealthRecords();
    fetchVaccinations();
  }, []);

  // Filter livestock
  const filteredLivestock = livestock.filter(animal => {
    const matchesSearch = animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.tagId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.breed.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecies = selectedSpecies === 'all' || animal.species === selectedSpecies;
    const matchesHealth = selectedHealthStatus === 'all' || animal.healthStatus === selectedHealthStatus;
    return matchesSearch && matchesSpecies && matchesHealth;
  });

  // Get health status color
  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'sick': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'quarantine': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'recovery': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'critical': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Get species icon
  const getSpeciesIcon = (species: string) => {
    switch (species) {
      case 'cattle': return <PawPrint className="h-5 w-5" />;
      case 'sheep': return <PawPrint className="h-5 w-5" />;
      case 'goat': return <PawPrint className="h-5 w-5" />;
      case 'pig': return <PawPrint className="h-5 w-5" />;
      case 'poultry': return <PawPrint className="h-5 w-5" />;
      case 'horse': return <PawPrint className="h-5 w-5" />;
      default: return <PawPrint className="h-5 w-5" />;
    }
  };

  // Add livestock
  const handleAddLivestock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/livestock', newLivestock);
      setShowAddLivestockModal(false);
      setNewLivestock({
        name: '',
        tagId: '',
        species: 'cattle',
        breed: '',
        dateOfBirth: '',
        gender: 'male',
        weight: '',
        location: '',
        healthStatus: 'healthy',
        notes: ''
      });
      fetchLivestock();
    } catch (err: any) {
      console.error('Failed to add livestock:', err);
    }
  };

  // Add health record
  const handleAddHealthRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/livestock/health-records', newHealthRecord);
      setShowAddHealthRecordModal(false);
      setNewHealthRecord({
        livestockId: '',
        recordType: 'checkup',
        date: new Date().toISOString().split('T')[0],
        veterinarian: '',
        diagnosis: '',
        treatment: '',
        medications: '',
        notes: '',
        followUpDate: '',
        status: 'scheduled'
      });
      fetchHealthRecords();
    } catch (err: any) {
      console.error('Failed to add health record:', err);
    }
  };

  // Add vaccination
  const handleAddVaccination = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/livestock/vaccinations', newVaccination);
      setShowAddVaccinationModal(false);
      setNewVaccination({
        livestockId: '',
        vaccineName: '',
        vaccineType: '',
        administrationDate: new Date().toISOString().split('T')[0],
        nextDueDate: '',
        veterinarian: '',
        batchNumber: '',
        notes: ''
      });
      fetchVaccinations();
    } catch (err: any) {
      console.error('Failed to add vaccination:', err);
    }
  };

  // Calculate health statistics
  const healthStats = {
    total: livestock.length,
    healthy: livestock.filter(a => a.healthStatus === 'healthy').length,
    sick: livestock.filter(a => a.healthStatus === 'sick').length,
    quarantine: livestock.filter(a => a.healthStatus === 'quarantine').length,
    recovery: livestock.filter(a => a.healthStatus === 'recovery').length,
    critical: livestock.filter(a => a.healthStatus === 'critical').length
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-0">
      {/* Header */}
      {/*<div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <Heart className="h-8 w-8 text-red-500" />
          Livestock Health Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor and manage livestock health records, vaccinations, and treatments
        </p>
      </div>*/}

      {/* Health Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold font-jetbrains-mono text-gray-900 dark:text-white">{healthStats.total}</p>
            </div>
            <PawPrint className="h-8 w-8 text-gray-500" />
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400">Healthy</p>
              <p className="text-2xl font-bold font-jetbrains-mono text-green-900 dark:text-green-100">{healthStats.healthy}</p>
            </div>
            <Activity className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 dark:text-red-400">Sick</p>
              <p className="text-2xl font-bold font-jetbrains-mono text-red-900 dark:text-red-100">{healthStats.sick}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">Quarantine</p>
              <p className="text-2xl font-bold font-jetbrains-mono text-yellow-900 dark:text-yellow-100">{healthStats.quarantine}</p>
            </div>
            <Shield className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400">Recovery</p>
              <p className="text-2xl font-bold font-jetbrains-mono text-blue-900 dark:text-blue-100">{healthStats.recovery}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-400">Critical</p>
              <p className="text-2xl font-bold font-jetbrains-mono text-purple-900 dark:text-purple-100">{healthStats.critical}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-4">
          <button
            onClick={() => setActiveTab('livestock')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'livestock'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <PawPrint className="h-4 w-4" />
            Livestock
          </button>
          <button
            onClick={() => setActiveTab('healthRecords')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'healthRecords'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            Health Records
          </button>
          <button
            onClick={() => setActiveTab('vaccinations')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'vaccinations'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Syringe className="h-4 w-4" />
            Vaccinations
          </button>
        </nav>
      </div>

      {/* Livestock Tab */}
      {activeTab === 'livestock' && (
        <div>
          {/* Search and Filter */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search livestock by name, tag ID, or breed..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <select
              value={selectedSpecies}
              onChange={(e) => setSelectedSpecies(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Species</option>
              <option value="cattle">Cattle</option>
              <option value="sheep">Sheep</option>
              <option value="goat">Goat</option>
              <option value="pig">Pig</option>
              <option value="poultry">Poultry</option>
              <option value="horse">Horse</option>
              <option value="other">Other</option>
            </select>
            <select
              value={selectedHealthStatus}
              onChange={(e) => setSelectedHealthStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="healthy">Healthy</option>
              <option value="sick">Sick</option>
              <option value="quarantine">Quarantine</option>
              <option value="recovery">Recovery</option>
              <option value="critical">Critical</option>
            </select>
            {user.role === 'OWNER' && (
              <button
                onClick={() => setShowAddLivestockModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Livestock
              </button>
            )}
          </div>

          {/* Livestock Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLivestock.map((animal) => (
              <div key={animal.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                      {getSpeciesIcon(animal.species)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{animal.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Tag: {animal.tagId}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(animal.healthStatus)}`}>
                    {animal.healthStatus}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Species:</span>
                    <span className="text-gray-900 dark:text-white capitalize">{animal.species}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Breed:</span>
                    <span className="text-gray-900 dark:text-white">{animal.breed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Weight:</span>
                    <span className="text-gray-900 dark:text-white">{animal.weight} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Location:</span>
                    <span className="text-gray-900 dark:text-white">{animal.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Last Checkup:</span>
                    <span className="text-gray-900 dark:text-white">{new Date(animal.lastCheckup).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setNewHealthRecord({ ...newHealthRecord, livestockId: animal.id })}
                    className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Details
                  </button>
                  <button
                    onClick={() => {
                      setNewHealthRecord({ ...newHealthRecord, livestockId: animal.id });
                      setShowAddHealthRecordModal(true);
                    }}
                    className="flex-1 px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <Stethoscope className="h-4 w-4" />
                    Checkup
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredLivestock.length === 0 && (
            <div className="text-center py-12">
              <PawPrint className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No livestock found</p>
            </div>
          )}
        </div>
      )}

      {/* Health Records Tab */}
      {activeTab === 'healthRecords' && (
        <div>
          {user.role === 'OWNER' && (
            <div className="mb-6 flex justify-end">
              <button
                onClick={() => setShowAddHealthRecordModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Health Record
              </button>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Livestock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Veterinarian</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Diagnosis</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {healthRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{livestock.find(l => l.id === record.livestockId)?.name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white capitalize">{record.recordType}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{record.veterinarian}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{record.diagnosis}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        record.status === 'scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {healthRecords.length === 0 && (
              <div className="text-center py-12">
                <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No health records found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vaccinations Tab */}
      {activeTab === 'vaccinations' && (
        <div>
          {user.role === 'OWNER' && (
            <div className="mb-6 flex justify-end">
              <button
                onClick={() => setShowAddVaccinationModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Vaccination
              </button>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Vaccine</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Livestock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Administered</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Next Due</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Veterinarian</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Batch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {vaccinations.map((vaccination) => (
                  <tr key={vaccination.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{vaccination.vaccineName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{livestock.find(l => l.id === vaccination.livestockId)?.name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{new Date(vaccination.administrationDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{new Date(vaccination.nextDueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{vaccination.veterinarian}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{vaccination.batchNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {vaccinations.length === 0 && (
              <div className="text-center py-12">
                <Syringe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No vaccination records found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Livestock Modal */}
      {showAddLivestockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add New Livestock</h2>
            <form onSubmit={handleAddLivestock} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={newLivestock.name}
                    onChange={(e) => setNewLivestock({ ...newLivestock, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tag ID *</label>
                  <input
                    type="text"
                    required
                    value={newLivestock.tagId}
                    onChange={(e) => setNewLivestock({ ...newLivestock, tagId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Species *</label>
                  <select
                    required
                    value={newLivestock.species}
                    onChange={(e) => setNewLivestock({ ...newLivestock, species: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="cattle">Cattle</option>
                    <option value="sheep">Sheep</option>
                    <option value="goat">Goat</option>
                    <option value="pig">Pig</option>
                    <option value="poultry">Poultry</option>
                    <option value="horse">Horse</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Breed *</label>
                  <input
                    type="text"
                    required
                    value={newLivestock.breed}
                    onChange={(e) => setNewLivestock({ ...newLivestock, breed: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={newLivestock.dateOfBirth}
                    onChange={(e) => setNewLivestock({ ...newLivestock, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                  <select
                    value={newLivestock.gender}
                    onChange={(e) => setNewLivestock({ ...newLivestock, gender: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weight (kg) *</label>
                  <input
                    type="number"
                    required
                    value={newLivestock.weight}
                    onChange={(e) => setNewLivestock({ ...newLivestock, weight: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={newLivestock.location}
                    onChange={(e) => setNewLivestock({ ...newLivestock, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Health Status</label>
                <select
                  value={newLivestock.healthStatus}
                  onChange={(e) => setNewLivestock({ ...newLivestock, healthStatus: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="healthy">Healthy</option>
                  <option value="sick">Sick</option>
                  <option value="quarantine">Quarantine</option>
                  <option value="recovery">Recovery</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea
                  value={newLivestock.notes}
                  onChange={(e) => setNewLivestock({ ...newLivestock, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddLivestockModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Add Livestock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Health Record Modal */}
      {showAddHealthRecordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Health Record</h2>
            <form onSubmit={handleAddHealthRecord} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Livestock *</label>
                <select
                  required
                  value={newHealthRecord.livestockId}
                  onChange={(e) => setNewHealthRecord({ ...newHealthRecord, livestockId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select livestock</option>
                  {livestock.map((animal) => (
                    <option key={animal.id} value={animal.id}>{animal.name} ({animal.tagId})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Record Type *</label>
                  <select
                    required
                    value={newHealthRecord.recordType}
                    onChange={(e) => setNewHealthRecord({ ...newHealthRecord, recordType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="checkup">Checkup</option>
                    <option value="vaccination">Vaccination</option>
                    <option value="treatment">Treatment</option>
                    <option value="surgery">Surgery</option>
                    <option value="lab_test">Lab Test</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={newHealthRecord.date}
                    onChange={(e) => setNewHealthRecord({ ...newHealthRecord, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Veterinarian *</label>
                <input
                  type="text"
                  required
                  value={newHealthRecord.veterinarian}
                  onChange={(e) => setNewHealthRecord({ ...newHealthRecord, veterinarian: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Diagnosis</label>
                <textarea
                  value={newHealthRecord.diagnosis}
                  onChange={(e) => setNewHealthRecord({ ...newHealthRecord, diagnosis: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Treatment</label>
                <textarea
                  value={newHealthRecord.treatment}
                  onChange={(e) => setNewHealthRecord({ ...newHealthRecord, treatment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Medications</label>
                <textarea
                  value={newHealthRecord.medications}
                  onChange={(e) => setNewHealthRecord({ ...newHealthRecord, medications: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Follow-up Date</label>
                  <input
                    type="date"
                    value={newHealthRecord.followUpDate}
                    onChange={(e) => setNewHealthRecord({ ...newHealthRecord, followUpDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={newHealthRecord.status}
                    onChange={(e) => setNewHealthRecord({ ...newHealthRecord, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea
                  value={newHealthRecord.notes}
                  onChange={(e) => setNewHealthRecord({ ...newHealthRecord, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddHealthRecordModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Add Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Vaccination Modal */}
      {showAddVaccinationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Vaccination</h2>
            <form onSubmit={handleAddVaccination} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Livestock *</label>
                <select
                  required
                  value={newVaccination.livestockId}
                  onChange={(e) => setNewVaccination({ ...newVaccination, livestockId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select livestock</option>
                  {livestock.map((animal) => (
                    <option key={animal.id} value={animal.id}>{animal.name} ({animal.tagId})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vaccine Name *</label>
                  <input
                    type="text"
                    required
                    value={newVaccination.vaccineName}
                    onChange={(e) => setNewVaccination({ ...newVaccination, vaccineName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vaccine Type</label>
                  <input
                    type="text"
                    value={newVaccination.vaccineType}
                    onChange={(e) => setNewVaccination({ ...newVaccination, vaccineType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Administration Date *</label>
                  <input
                    type="date"
                    required
                    value={newVaccination.administrationDate}
                    onChange={(e) => setNewVaccination({ ...newVaccination, administrationDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Next Due Date</label>
                  <input
                    type="date"
                    value={newVaccination.nextDueDate}
                    onChange={(e) => setNewVaccination({ ...newVaccination, nextDueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Veterinarian *</label>
                  <input
                    type="text"
                    required
                    value={newVaccination.veterinarian}
                    onChange={(e) => setNewVaccination({ ...newVaccination, veterinarian: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={newVaccination.batchNumber}
                    onChange={(e) => setNewVaccination({ ...newVaccination, batchNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea
                  value={newVaccination.notes}
                  onChange={(e) => setNewVaccination({ ...newVaccination, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddVaccinationModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Add Vaccination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LivestockHealth;
