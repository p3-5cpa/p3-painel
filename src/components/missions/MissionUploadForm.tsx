import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMissions, Mission } from "@/hooks/useMissions";
import { toast } from "@/hooks/use-toast";

interface MissionUploadFormProps {
  mission: Mission;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MissionUploadForm({ mission, onSuccess, onCancel }: MissionUploadFormProps) {
  const { user } = useAuth();
  const { addSubmission } = useMissions();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !file) {
      toast({
        title: "Arquivo obrigatório",
        description: "Por favor, selecione um arquivo para enviar.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Em um cenário real, aqui faria o upload do arquivo para um servidor
      // e obteria a URL do arquivo
      const fileUrl = URL.createObjectURL(file);
      
      const success = await addSubmission(mission.id, {
        userId: user.id,
        fileName: file.name,
        fileUrl: fileUrl,
        fileType: file.type,
        fileSize: file.size,
        comments: comment ? [
          {
            id: Date.now().toString(),
            text: comment,
            date: new Date().toISOString(),
            author: {
              id: user.id,
              name: user.name,
            },
          },
        ] : undefined,
      });
      
      if (success && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Erro ao enviar arquivo:", error);
      
      toast({
        title: "Erro ao enviar arquivo",
        description: "Ocorreu um erro ao enviar o arquivo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Enviar Relatório</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Arquivo</Label>
            <div className="grid gap-2">
              {file ? (
                <div className="flex items-center p-3 bg-muted rounded-md">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={clearFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Clique para selecionar um arquivo</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ou arraste e solte aqui
                  </p>
                </div>
              )}
              <Input
                id="file"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="comment">Comentário (opcional)</Label>
            <Textarea
              id="comment"
              placeholder="Adicione um comentário sobre o relatório..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-pmerj-blue hover:bg-pmerj-blue/90"
            disabled={!file || isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Enviar Relatório"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
