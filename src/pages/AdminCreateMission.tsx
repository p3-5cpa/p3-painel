import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Save } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useUsers } from "@/hooks/useUsers";
import { useMissions } from "@/hooks/useMissions";
import { toast } from "@/hooks/use-toast";

const AdminCreateMission = () => {
  const navigate = useNavigate();
  const { getUnits } = useUsers();
  const { addMission } = useMissions();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [day, setDay] = useState("");
  const [unitId, setUnitId] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Adicionar opção "Todas" às unidades existentes
  const allUnits = [
    { id: "all", name: "Todas as unidades" },
    ...getUnits()
  ];
  
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !day || !unitId || !dueDate) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Se for "Todas", definir um nome específico
      const unitName = unitId === "all" ? "Todas as unidades" : allUnits.find(unit => unit.id === unitId)?.name || "";
      
      const success = await addMission({
        title,
        description,
        day,
        unitId,
        unitName,
        dueDate: dueDate.toISOString(),
        submissions: [],
      });
      
      if (success) {
        toast({
          title: "Missão criada",
          description: "A missão diária foi criada com sucesso.",
        });
        
        navigate("/admin/missions");
      }
    } catch (error) {
      console.error("Erro ao criar missão:", error);
      
      toast({
        title: "Erro ao criar missão",
        description: "Ocorreu um erro ao criar a missão diária.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Criar Missão Diária</h1>
          <p className="text-muted-foreground">
            Crie uma nova missão diária para as unidades
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Nova Missão</CardTitle>
            <CardDescription>
              Preencha os detalhes da missão diária
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Título da Missão</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Relatório de Ocorrências"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva os detalhes da missão e o que deve ser entregue"
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="day">Dia da Semana</Label>
                    <Select value={day} onValueChange={setDay}>
                      <SelectTrigger id="day">
                        <SelectValue placeholder="Selecione o dia" />
                      </SelectTrigger>
                      <SelectContent>
                        {weekDays.map((weekDay) => (
                          <SelectItem key={weekDay.value} value={weekDay.value}>
                            {weekDay.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="unit">Unidade</Label>
                    <Select value={unitId} onValueChange={setUnitId}>
                      <SelectTrigger id="unit">
                        <SelectValue placeholder="Selecione a unidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {allUnits.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Data de Vencimento</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        id="dueDate"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? (
                          format(dueDate, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin/missions")}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-pmerj-blue hover:bg-pmerj-blue/90"
                  disabled={isSubmitting}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Salvando..." : "Salvar Missão"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminCreateMission;
