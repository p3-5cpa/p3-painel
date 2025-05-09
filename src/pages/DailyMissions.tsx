import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileUp, AlertCircle, X, Pencil, Trash, Eye } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMissions, Mission, MissionSubmission } from "@/hooks/useMissions";
import { MissionUploadForm } from "@/components/missions/MissionUploadForm";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const DailyMissions = () => {
  const { user } = useAuth();
  const { 
    missions, 
    loading, 
    getUserMissionsByDay, 
    updateSubmission, 
    deleteSubmission 
  } = useMissions();
  const [activeTab, setActiveTab] = useState<string>("");
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  
  // Estados para visualização, edição e exclusão de submissões
  const [selectedSubmission, setSelectedSubmission] = useState<MissionSubmission | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editFileName, setEditFileName] = useState("");
  
  // Dias da semana em português
  const weekDays = [
    { value: "domingo", label: "Domingo" },
    { value: "segunda", label: "Segunda" },
    { value: "terca", label: "Terça" },
    { value: "quarta", label: "Quarta" },
    { value: "quinta", label: "Quinta" },
    { value: "sexta", label: "Sexta" },
    { value: "sabado", label: "Sábado" },
  ];
  
  // Obter o dia da semana atual
  useEffect(() => {
    const today = new Date();
    const dayOfWeek = format(today, "EEEE", { locale: ptBR }).toLowerCase();
    
    // Mapear o nome do dia para o valor da tab
    const dayMap: Record<string, string> = {
      "domingo": "domingo",
      "segunda-feira": "segunda",
      "terça-feira": "terca",
      "quarta-feira": "quarta",
      "quinta-feira": "quinta",
      "sexta-feira": "sexta",
      "sábado": "sabado",
    };
    
    setActiveTab(dayMap[dayOfWeek] || "segunda");
  }, []);
  
  // Obter missões do usuário para o dia selecionado
  const getMissionsForDay = (day: string) => {
    if (!user) return [];
    return getUserMissionsByDay(user.id, day);
  };
  
  // Função para visualizar um arquivo
  const handleViewSubmission = (mission: Mission, submission: MissionSubmission) => {
    setSelectedMission(mission);
    setSelectedSubmission(submission);
    setIsViewDialogOpen(true);
  };
  
  // Função para abrir o diálogo de edição
  const handleEditSubmission = (mission: Mission, submission: MissionSubmission) => {
    setSelectedMission(mission);
    setSelectedSubmission(submission);
    setEditFileName(submission.fileName);
    setIsEditDialogOpen(true);
  };
  
  // Função para salvar a edição
  const handleSaveEdit = async () => {
    if (!selectedMission || !selectedSubmission || !editFileName.trim()) {
      toast({
        title: "Nome de arquivo inválido",
        description: "Por favor, insira um nome de arquivo válido.",
        variant: "destructive",
      });
      return;
    }
    
    const success = await updateSubmission(
      selectedMission.id,
      selectedSubmission.id,
      { fileName: editFileName }
    );
    
    if (success) {
      setIsEditDialogOpen(false);
    }
  };
  
  // Função para abrir o diálogo de exclusão
  const handleDeleteSubmission = (mission: Mission, submission: MissionSubmission) => {
    setSelectedMission(mission);
    setSelectedSubmission(submission);
    setIsDeleteDialogOpen(true);
  };
  
  // Função para confirmar a exclusão
  const handleConfirmDelete = async () => {
    if (!selectedMission || !selectedSubmission) return;
    
    const success = await deleteSubmission(
      selectedMission.id,
      selectedSubmission.id
    );
    
    if (success) {
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Dialog para upload de relatório */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Enviar Relatório da Missão</DialogTitle>
              <Button
                className="absolute right-4 top-4" 
                variant="ghost" 
                size="icon"
                onClick={() => setIsUploadDialogOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>
            {selectedMission && (
              <MissionUploadForm 
                mission={selectedMission} 
                onSuccess={() => setIsUploadDialogOpen(false)}
                onCancel={() => setIsUploadDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
        
        {/* Dialog para visualizar arquivo */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Visualizar Arquivo</DialogTitle>
              <Button
                className="absolute right-4 top-4" 
                variant="ghost" 
                size="icon"
                onClick={() => setIsViewDialogOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>
            {selectedSubmission && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{selectedSubmission.fileName}</h3>
                    <p className="text-sm text-muted-foreground">
                      Enviado em: {format(new Date(selectedSubmission.submissionDate), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        if (selectedMission) {
                          handleEditSubmission(selectedMission, selectedSubmission);
                        }
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        if (selectedMission) {
                          handleDeleteSubmission(selectedMission, selectedSubmission);
                        }
                      }}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-md p-4 h-[400px] overflow-auto">
                  {/* Em um cenário real, aqui seria exibido o conteúdo do arquivo */}
                  {selectedSubmission.fileType.startsWith("image/") ? (
                    <img 
                      src={selectedSubmission.fileUrl} 
                      alt={selectedSubmission.fileName} 
                      className="max-w-full h-auto mx-auto"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <FileUp className="h-16 w-16 text-muted-foreground mb-4" />
                      <p className="text-center">
                        Visualização não disponível para este tipo de arquivo.<br />
                        <a 
                          href={selectedSubmission.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Clique aqui para baixar o arquivo
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Dialog para editar nome do arquivo */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Editar Arquivo</DialogTitle>
              <DialogDescription>
                Altere o nome do arquivo enviado.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fileName">Nome do arquivo</Label>
                <Input 
                  id="fileName" 
                  value={editFileName} 
                  onChange={(e) => setEditFileName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveEdit}>Salvar alterações</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Dialog para confirmar exclusão */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este arquivo? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Missões Diárias</h1>
          <p className="text-muted-foreground">
            Envie os relatórios das missões diárias designadas para sua unidade
          </p>
        </div>
        
        {activeTab && (
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-7 mb-8">
              {weekDays.map((day) => (
                <TabsTrigger key={day.value} value={day.value}>
                  {day.label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {weekDays.map((day) => {
              const dayMissions = getMissionsForDay(day.value);
              
              return (
                <TabsContent key={day.value} value={day.value} className="space-y-6">
                  <h2 className="text-2xl font-semibold">
                    Missões de {day.label}
                  </h2>
                  
                  {loading ? (
                    <Card className="p-8">
                      <div className="flex justify-center items-center">
                        <p>Carregando missões...</p>
                      </div>
                    </Card>
                  ) : dayMissions.length > 0 ? (
                    <div className="grid gap-6">
                      {dayMissions.map((mission) => (
                        <Card key={mission.id} className="overflow-hidden">
                          <CardHeader className="py-4">
                            <CardTitle className="text-lg">{mission.title}</CardTitle>
                            <CardDescription className="line-clamp-2">
                              {mission.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="py-3">
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-sm font-medium">
                                    Data de Criação: {format(new Date(mission.createdAt), "dd/MM/yyyy")}
                                  </p>
                                  <p className="text-sm font-medium">
                                    Prazo: {format(new Date(mission.dueDate), "dd/MM/yyyy")}
                                  </p>
                                </div>
                                
                                {mission.submissions?.some(sub => sub.userId === user?.id) ? (
                                  <div className="flex items-center text-green-600">
                                    <FileUp className="mr-2 h-5 w-5" />
                                    <span>Enviado</span>
                                  </div>
                                ) : (
                                  <Button 
                                    onClick={() => {
                                      setSelectedMission(mission);
                                      setIsUploadDialogOpen(true);
                                    }}
                                    className="bg-pmerj-blue hover:bg-pmerj-blue/90"
                                    size="sm"
                                  >
                                    <Upload className="mr-2 h-4 w-4" />
                                    Enviar Relatório
                                  </Button>
                                )}
                              </div>
                              
                              {new Date(mission.dueDate) < new Date() && !mission.submissions?.some(sub => sub.userId === user?.id) && (
                                <div className="flex items-center p-3 bg-red-100 text-red-800 rounded-md">
                                  <AlertCircle className="mr-2 h-5 w-5" />
                                  <span>Prazo expirado! Entre em contato com seu supervisor.</span>
                                </div>
                              )}
                              
                              {mission.submissions?.some(sub => sub.userId === user?.id) && (
                                <div className="mt-4">
                                  <h4 className="font-medium mb-2">Seu envio:</h4>
                                  <div className="p-3 bg-muted rounded-md">
                                    {mission.submissions
                                      .filter(sub => sub.userId === user?.id)
                                      .map(sub => (
                                        <div key={sub.id} className="flex justify-between items-center">
                                          <div>
                                            <p>{sub.fileName}</p>
                                            <p className="text-xs text-muted-foreground">
                                              Enviado em: {format(new Date(sub.submissionDate), "dd/MM/yyyy HH:mm")}
                                            </p>
                                          </div>
                                          <div className="flex gap-2">
                                            <Button 
                                              variant="outline" 
                                              size="sm"
                                              onClick={() => handleViewSubmission(mission, sub)}
                                            >
                                              <Eye className="mr-1 h-3 w-3" />
                                              Ver
                                            </Button>
                                            <Button 
                                              variant="outline" 
                                              size="sm"
                                              onClick={() => handleEditSubmission(mission, sub)}
                                            >
                                              <Pencil className="mr-1 h-3 w-3" />
                                              Editar
                                            </Button>
                                            <Button 
                                              variant="destructive" 
                                              size="sm"
                                              onClick={() => handleDeleteSubmission(mission, sub)}
                                            >
                                              <Trash className="mr-1 h-3 w-3" />
                                              Excluir
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="p-8">
                      <div className="text-center space-y-4">
                        <h3 className="text-lg font-medium">Nenhuma missão para {day.label}</h3>
                        <p className="text-muted-foreground">
                          Não há missões designadas para este dia.
                        </p>
                      </div>
                    </Card>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </div>
    </MainLayout>
  );
};

export default DailyMissions;
