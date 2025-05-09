import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calendar, Clock, FileUp, Eye, Pencil, Trash, X, Users, Building } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMissions, Mission, MissionSubmission } from "@/hooks/useMissions";
import { useUsers } from "@/hooks/useUsers";
import { toast } from "@/hooks/use-toast";

const AdminMissionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { missions, getMissionById, updateSubmission, deleteSubmission } = useMissions();
  const { getUnits } = useUsers();
  
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("detalhes");
  
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
  
  useEffect(() => {
    if (id) {
      const missionData = getMissionById(id);
      if (missionData) {
        setMission(missionData);
      } else {
        toast({
          title: "Missão não encontrada",
          description: "A missão solicitada não foi encontrada.",
          variant: "destructive",
        });
        navigate("/admin/missions");
      }
      setLoading(false);
    }
  }, [id, getMissionById, navigate, missions]);
  
  // Função para visualizar um arquivo
  const handleViewSubmission = (submission: MissionSubmission) => {
    setSelectedSubmission(submission);
    setIsViewDialogOpen(true);
  };
  
  // Função para abrir o diálogo de edição
  const handleEditSubmission = (submission: MissionSubmission) => {
    setSelectedSubmission(submission);
    setEditFileName(submission.fileName);
    setIsEditDialogOpen(true);
  };
  
  // Função para salvar a edição
  const handleSaveEdit = async () => {
    if (!mission || !selectedSubmission || !editFileName.trim()) {
      toast({
        title: "Nome de arquivo inválido",
        description: "Por favor, insira um nome de arquivo válido.",
        variant: "destructive",
      });
      return;
    }
    
    const success = await updateSubmission(
      mission.id,
      selectedSubmission.id,
      { fileName: editFileName }
    );
    
    if (success) {
      setIsEditDialogOpen(false);
    }
  };
  
  // Função para abrir o diálogo de exclusão
  const handleDeleteSubmission = (submission: MissionSubmission) => {
    setSelectedSubmission(submission);
    setIsDeleteDialogOpen(true);
  };
  
  // Função para confirmar a exclusão
  const handleConfirmDelete = async () => {
    if (!mission || !selectedSubmission) return;
    
    const success = await deleteSubmission(
      mission.id,
      selectedSubmission.id
    );
    
    if (success) {
      setIsDeleteDialogOpen(false);
    }
  };
  
  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <p>Carregando detalhes da missão...</p>
        </div>
      </MainLayout>
    );
  }
  
  if (!mission) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <p>Missão não encontrada.</p>
        </div>
      </MainLayout>
    );
  }
  
  // Encontrar o label do dia da semana
  const dayLabel = weekDays.find(d => d.value === mission.day)?.label || mission.day;
  
  // Verificar se a data de vencimento já passou
  const isPastDue = new Date(mission.dueDate) < new Date();
  
  return (
    <MainLayout>
      <div className="space-y-6">
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
                      Enviado por: {selectedSubmission.userName}<br />
                      Enviado em: {format(new Date(selectedSubmission.submissionDate), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        handleEditSubmission(selectedSubmission);
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
                        handleDeleteSubmission(selectedSubmission);
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
        
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate("/admin/missions")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{mission.title}</h1>
              <p className="text-muted-foreground">
                Detalhes da missão diária
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={() => navigate(`/admin/missions/edit/${mission.id}`)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar Missão
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="detalhes" onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
            <TabsTrigger value="envios">
              Envios ({mission.submissions?.length || 0})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="detalhes" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações da Missão</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Descrição</h3>
                    <p className="mt-1">{mission.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Dia da Semana</h3>
                      <div className="mt-1 flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{dayLabel}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Data de Vencimento</h3>
                      <div className="mt-1 flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(mission.dueDate), "dd/MM/yyyy", { locale: ptBR })}</span>
                        {isPastDue && (
                          <Badge variant="destructive" className="ml-2">
                            Vencida
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Unidade</h3>
                      <div className="mt-1 flex items-center">
                        <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{mission.unitName}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Criada em</h3>
                      <div className="mt-1 flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(mission.createdAt), "dd/MM/yyyy", { locale: ptBR })}</span>
                      </div>
                    </div>
                  </div>
                  
                  {mission.createdBy && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Criada por</h3>
                      <div className="mt-1 flex items-center">
                        <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{mission.createdBy.name}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Status dos Envios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Total de Envios</span>
                        <span className="text-sm font-medium">{mission.submissions?.length || 0}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ 
                            width: mission.submissions?.length ? '100%' : '0%' 
                          }}
                        />
                      </div>
                    </div>
                    
                    {mission.unitId === "all" && (
                      <div className="mt-6">
                        <h3 className="text-sm font-medium mb-4">Envios por Unidade</h3>
                        <div className="space-y-4">
                          {getUnits().map(unit => {
                            const unitSubmissions = mission.submissions?.filter(
                              sub => sub.userId.startsWith(unit.id)
                            ) || [];
                            
                            return (
                              <div key={unit.id}>
                                <div className="flex justify-between mb-2">
                                  <span className="text-sm">{unit.name}</span>
                                  <span className="text-sm">{unitSubmissions.length}</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary" 
                                    style={{ 
                                      width: unitSubmissions.length ? '100%' : '0%' 
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="envios" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Arquivos Enviados</CardTitle>
                <CardDescription>
                  Lista de todos os arquivos enviados para esta missão
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mission.submissions && mission.submissions.length > 0 ? (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Arquivo</TableHead>
                          <TableHead>Enviado por</TableHead>
                          <TableHead>Data de Envio</TableHead>
                          <TableHead>Tamanho</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mission.submissions.map((submission) => (
                          <TableRow key={submission.id}>
                            <TableCell className="font-medium">{submission.fileName}</TableCell>
                            <TableCell>{submission.userName}</TableCell>
                            <TableCell>
                              {format(new Date(submission.submissionDate), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </TableCell>
                            <TableCell>
                              {(submission.fileSize / 1024 / 1024).toFixed(2)} MB
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleViewSubmission(submission)}
                                >
                                  <Eye className="mr-1 h-3 w-3" />
                                  Ver
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEditSubmission(submission)}
                                >
                                  <Pencil className="mr-1 h-3 w-3" />
                                  Editar
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleDeleteSubmission(submission)}
                                >
                                  <Trash className="mr-1 h-3 w-3" />
                                  Excluir
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileUp className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Nenhum arquivo enviado</h3>
                    <p className="text-muted-foreground mt-2">
                      Ainda não há envios para esta missão.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AdminMissionDetail;
