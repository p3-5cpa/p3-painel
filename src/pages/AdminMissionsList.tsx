import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash, 
  FileCheck
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMissions } from "@/hooks/useMissions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const AdminMissionsList = () => {
  const navigate = useNavigate();
  const { missions, loading, deleteMission } = useMissions();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string>("todas");
  const [missionToDelete, setMissionToDelete] = useState<string | null>(null);
  
  // Dias da semana em português
  const weekDays = [
    { value: "todas", label: "Todas" },
    { value: "domingo", label: "Domingo" },
    { value: "segunda", label: "Segunda" },
    { value: "terca", label: "Terça" },
    { value: "quarta", label: "Quarta" },
    { value: "quinta", label: "Quinta" },
    { value: "sexta", label: "Sexta" },
    { value: "sabado", label: "Sábado" },
  ];
  
  // Filtrar missões com base na pesquisa e na aba ativa
  const filteredMissions = missions.filter((mission) => {
    const matchesSearch = 
      mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.unitName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === "todas" || mission.day === activeTab;
    
    return matchesSearch && matchesTab;
  });
  
  // Ordenar missões por data de criação (mais recentes primeiro)
  const sortedMissions = [...filteredMissions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Função para confirmar exclusão
  const confirmDelete = async () => {
    if (missionToDelete) {
      await deleteMission(missionToDelete);
      setMissionToDelete(null);
    }
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gerenciar Missões Diárias</h1>
            <p className="text-muted-foreground">
              Gerencie as missões diárias para as unidades
            </p>
          </div>
          
          <Button 
            onClick={() => navigate("/admin/missions/new")}
            className="bg-pmerj-blue hover:bg-pmerj-blue/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Missão
          </Button>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar missões..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <Tabs defaultValue="todas" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            {weekDays.map((day) => (
              <TabsTrigger key={day.value} value={day.value}>
                {day.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={activeTab}>
            {loading ? (
              <div className="flex justify-center py-8">
                <p>Carregando missões...</p>
              </div>
            ) : sortedMissions.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Unidade</TableHead>
                      <TableHead>Dia</TableHead>
                      <TableHead>Data de Vencimento</TableHead>
                      <TableHead>Envios</TableHead>
                      <TableHead className="w-[80px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedMissions.map((mission) => {
                      // Mapear o valor do dia para o label
                      const dayLabel = weekDays.find(d => d.value === mission.day)?.label || mission.day;
                      
                      // Verificar se a data de vencimento já passou
                      const isPastDue = new Date(mission.dueDate) < new Date();
                      
                      return (
                        <TableRow key={mission.id}>
                          <TableCell className="font-medium">{mission.title}</TableCell>
                          <TableCell>{mission.unitName}</TableCell>
                          <TableCell>{dayLabel}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {format(new Date(mission.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                              {isPastDue && (
                                <Badge variant="destructive" className="ml-2">
                                  Vencida
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <FileCheck className="mr-2 h-4 w-4 text-green-500" />
                              <span>{mission.submissions?.length || 0}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate(`/admin/missions/${mission.id}`)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  <span>Visualizar</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate(`/admin/missions/edit/${mission.id}`)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Editar</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => setMissionToDelete(mission.id)}
                                  className="text-red-600"
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  <span>Excluir</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 border rounded-md">
                <p className="text-muted-foreground mb-4">Nenhuma missão encontrada</p>
                <Button 
                  onClick={() => navigate("/admin/missions/new")}
                  className="bg-pmerj-blue hover:bg-pmerj-blue/90"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Nova Missão
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={!!missionToDelete} onOpenChange={(open) => !open && setMissionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta missão? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default AdminMissionsList;
