import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth, User } from './useAuth';
import { toast } from '@/hooks/use-toast';

// Tipos
export type MissionSubmission = {
  id: string;
  userId: string;
  userName: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  submissionDate: string;
  comments?: {
    id: string;
    text: string;
    date: string;
    author: {
      id: string;
      name: string;
    };
  }[];
};

export interface Mission {
  id: string;
  title: string;
  description: string;
  day: string; // domingo, segunda, terca, quarta, quinta, sexta, sabado
  unitId: string;
  unitName: string;
  createdAt: string;
  dueDate: string;
  createdBy?: {
    id: string;
    name: string;
  };
  submissions?: MissionSubmission[];
}

interface MissionsContextType {
  missions: Mission[];
  loading: boolean;
  addMission: (mission: Omit<Mission, 'id' | 'createdAt' | 'createdBy'>) => Promise<boolean>;
  updateMission: (id: string, data: Partial<Omit<Mission, 'id' | 'createdAt' | 'createdBy'>>) => Promise<boolean>;
  deleteMission: (id: string) => Promise<boolean>;
  getMissionById: (id: string) => Mission | undefined;
  getUserMissions: (userId: string) => Mission[];
  getUserMissionsByDay: (userId: string, day: string) => Mission[];
  getUnitMissions: (unitId: string) => Mission[];
  addSubmission: (missionId: string, submission: Omit<MissionSubmission, 'id' | 'submissionDate' | 'userName'>) => Promise<boolean>;
  updateSubmission: (missionId: string, submissionId: string, data: Partial<Omit<MissionSubmission, 'id' | 'submissionDate' | 'userName'>>) => Promise<boolean>;
  deleteSubmission: (missionId: string, submissionId: string) => Promise<boolean>;
  getSubmissionById: (missionId: string, submissionId: string) => MissionSubmission | undefined;
}

// Mock de missões iniciais
const MOCK_MISSIONS: Mission[] = [
  {
    id: '1',
    title: 'Relatório de Ocorrências',
    description: 'Enviar relatório diário de ocorrências registradas na unidade',
    day: 'segunda',
    unitId: '2',
    unitName: '10º BPM',
    createdAt: '2025-05-01T10:00:00',
    dueDate: '2025-05-12T23:59:59',
    createdBy: {
      id: '1',
      name: 'Admin Geral',
    },
    submissions: [
      {
        id: '1',
        userId: '2',
        userName: 'João Silva',
        fileName: 'relatorio_ocorrencias_10bpm.pdf',
        fileUrl: '/missions/relatorio_ocorrencias_10bpm.pdf',
        fileType: 'application/pdf',
        fileSize: 1024 * 1024 * 1.5, // 1.5MB
        submissionDate: '2025-05-06T14:30:00',
        comments: [
          {
            id: '1',
            text: 'Relatório recebido, obrigado.',
            date: '2025-05-06T15:20:00',
            author: {
              id: '1',
              name: 'Admin Geral',
            },
          },
        ],
      },
    ],
  },
  {
    id: '2',
    title: 'Escala de Serviço',
    description: 'Enviar escala de serviço para a próxima semana',
    day: 'sexta',
    unitId: '2',
    unitName: '10º BPM',
    createdAt: '2025-05-02T09:15:00',
    dueDate: '2025-05-10T18:00:00',
    createdBy: {
      id: '1',
      name: 'Admin Geral',
    },
  },
  {
    id: '3',
    title: 'Relatório de Efetivo',
    description: 'Enviar relatório de efetivo disponível',
    day: 'quarta',
    unitId: '3',
    unitName: '12º BPM',
    createdAt: '2025-05-03T11:30:00',
    dueDate: '2025-05-15T23:59:59',
    createdBy: {
      id: '1',
      name: 'Admin Geral',
    },
  },
];

const MissionsContext = createContext<MissionsContextType | undefined>(undefined);

export function MissionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simula carregamento das missões (em um cenário real, seria uma chamada à API)
    const loadMissions = () => {
      setTimeout(() => {
        // Obter dados do localStorage ou usar os mocks iniciais
        const storedMissions = localStorage.getItem('pmerj_missions');
        if (storedMissions) {
          setMissions(JSON.parse(storedMissions));
        } else {
          setMissions(MOCK_MISSIONS);
          localStorage.setItem('pmerj_missions', JSON.stringify(MOCK_MISSIONS));
        }
        setLoading(false);
      }, 500);
    };
    
    loadMissions();
  }, []);
  
  const addMission = async (missionData: Omit<Mission, 'id' | 'createdAt' | 'createdBy'>) => {
    if (!user) return false;
    
    try {
      const mission: Mission = {
        ...missionData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        createdBy: {
          id: user.id,
          name: user.name,
        },
        submissions: [],
      };
      
      const updatedMissions = [...missions, mission];
      setMissions(updatedMissions);
      localStorage.setItem('pmerj_missions', JSON.stringify(updatedMissions));
      
      toast({
        title: "Missão criada",
        description: "A missão diária foi criada com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao adicionar missão:', error);
      
      toast({
        title: "Erro ao criar missão",
        description: "Ocorreu um erro ao criar a missão diária.",
        variant: "destructive",
      });
      
      return false;
    }
  };
  
  const updateMission = async (id: string, data: Partial<Omit<Mission, 'id' | 'createdAt' | 'createdBy'>>) => {
    try {
      const updatedMissions = missions.map((mission) => {
        if (mission.id === id) {
          return { ...mission, ...data };
        }
        return mission;
      });
      
      setMissions(updatedMissions);
      localStorage.setItem('pmerj_missions', JSON.stringify(updatedMissions));
      
      toast({
        title: "Missão atualizada",
        description: "A missão diária foi atualizada com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar missão:', error);
      
      toast({
        title: "Erro ao atualizar missão",
        description: "Ocorreu um erro ao atualizar a missão diária.",
        variant: "destructive",
      });
      
      return false;
    }
  };
  
  const deleteMission = async (id: string) => {
    try {
      const updatedMissions = missions.filter((mission) => mission.id !== id);
      
      setMissions(updatedMissions);
      localStorage.setItem('pmerj_missions', JSON.stringify(updatedMissions));
      
      toast({
        title: "Missão excluída",
        description: "A missão diária foi excluída com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir missão:', error);
      
      toast({
        title: "Erro ao excluir missão",
        description: "Ocorreu um erro ao excluir a missão diária.",
        variant: "destructive",
      });
      
      return false;
    }
  };
  
  const getMissionById = (id: string) => {
    return missions.find((mission) => mission.id === id);
  };
  
  const getUserMissions = (userId: string) => {
    // Retorna missões da unidade do usuário e missões para todas as unidades
    const userUnit = user?.unit.id;
    return missions.filter((mission) => mission.unitId === userUnit || mission.unitId === "all");
  };
  
  const getUserMissionsByDay = (userId: string, day: string) => {
    // Retorna missões da unidade do usuário e missões para todas as unidades para um dia específico
    const userUnit = user?.unit.id;
    return missions.filter((mission) => (mission.unitId === userUnit || mission.unitId === "all") && mission.day === day);
  };
  
  const getUnitMissions = (unitId: string) => {
    return missions.filter((mission) => mission.unitId === unitId);
  };
  
  const addSubmission = async (missionId: string, submissionData: Omit<MissionSubmission, 'id' | 'submissionDate' | 'userName'>) => {
    if (!user) return false;
    
    try {
      const updatedMissions = missions.map((mission) => {
        if (mission.id === missionId) {
          const submission: MissionSubmission = {
            ...submissionData,
            id: Date.now().toString(),
            submissionDate: new Date().toISOString(),
            userName: user.name,
          };
          
          return {
            ...mission,
            submissions: [...(mission.submissions || []), submission],
          };
        }
        return mission;
      });
      
      setMissions(updatedMissions);
      localStorage.setItem('pmerj_missions', JSON.stringify(updatedMissions));
      
      toast({
        title: "Relatório enviado",
        description: "Seu relatório foi enviado com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao adicionar submissão:', error);
      
      toast({
        title: "Erro ao enviar relatório",
        description: "Ocorreu um erro ao enviar seu relatório.",
        variant: "destructive",
      });
      
      return false;
    }
  };
  
  // Função para atualizar uma submissão existente
  const updateSubmission = async (missionId: string, submissionId: string, data: Partial<Omit<MissionSubmission, 'id' | 'submissionDate' | 'userName'>>) => {
    if (!user) return false;
    
    try {
      const updatedMissions = missions.map((mission) => {
        if (mission.id === missionId) {
          const updatedSubmissions = mission.submissions?.map((submission) => {
            if (submission.id === submissionId) {
              return { ...submission, ...data };
            }
            return submission;
          }) || [];
          
          return {
            ...mission,
            submissions: updatedSubmissions,
          };
        }
        return mission;
      });
      
      setMissions(updatedMissions);
      localStorage.setItem('pmerj_missions', JSON.stringify(updatedMissions));
      
      toast({
        title: "Envio atualizado",
        description: "As informações do envio foram atualizadas com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar envio:', error);
      
      toast({
        title: "Erro ao atualizar envio",
        description: "Ocorreu um erro ao atualizar as informações do envio.",
        variant: "destructive",
      });
      
      return false;
    }
  };
  
  // Função para excluir uma submissão
  const deleteSubmission = async (missionId: string, submissionId: string) => {
    try {
      const updatedMissions = missions.map((mission) => {
        if (mission.id === missionId) {
          const updatedSubmissions = mission.submissions?.filter(
            (submission) => submission.id !== submissionId
          ) || [];
          
          return {
            ...mission,
            submissions: updatedSubmissions,
          };
        }
        return mission;
      });
      
      setMissions(updatedMissions);
      localStorage.setItem('pmerj_missions', JSON.stringify(updatedMissions));
      
      toast({
        title: "Envio excluído",
        description: "O envio foi excluído com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir envio:', error);
      
      toast({
        title: "Erro ao excluir envio",
        description: "Ocorreu um erro ao excluir o envio.",
        variant: "destructive",
      });
      
      return false;
    }
  };
  
  // Função para obter uma submissão específica
  const getSubmissionById = (missionId: string, submissionId: string) => {
    const mission = getMissionById(missionId);
    return mission?.submissions?.find((submission) => submission.id === submissionId);
  };

  const value = {
    missions,
    loading,
    addMission,
    updateMission,
    deleteMission,
    getMissionById,
    getUserMissions,
    getUserMissionsByDay,
    getUnitMissions,
    addSubmission,
    updateSubmission,
    deleteSubmission,
    getSubmissionById,
  };
  
  return <MissionsContext.Provider value={value}>{children}</MissionsContext.Provider>;
}

export const useMissions = () => {
  const context = useContext(MissionsContext);
  if (context === undefined) {
    throw new Error('useMissions deve ser usado dentro de um MissionsProvider');
  }
  return context;
};
