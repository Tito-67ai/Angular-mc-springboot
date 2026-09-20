import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Docente } from '../models/docente';
import { DocenteService } from '../services/docente.service';

@Component({
  selector: 'app-administracion',
  templateUrl: './administracion.html',
  styleUrl: './administracion.css',
  imports: [FormsModule],
})
export class AdministracionComponent implements OnInit {
  docentes = signal<Docente[]>([]);
  mensaje = signal('');
  editando = signal<Docente | null>(null);
  formulario: Docente = this.nuevoFormulario();

  constructor(private docenteService: DocenteService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.docenteService.listar().subscribe({
      next: (data) => this.docentes.set(data),
      error: () => this.mensaje.set('Error al obtener los docentes. Verifique que el gateway esté activo.'),
    });
  }

  nuevoFormulario(): Docente {
    return { id: 0, nombre: '', apellido: '', email: '', especialidad: '' };
  }

  editar(docente: Docente): void {
    this.editando.set(docente);
    this.formulario = { ...docente };
  }

  cancelar(): void {
    this.editando.set(null);
    this.formulario = this.nuevoFormulario();
  }

  guardar(): void {
    if (this.editando()) {
      const original = this.editando()!;
      this.docenteService.actualizar(original.id, this.formulario).subscribe({
        next: () => {
          this.mensaje.set('Docente actualizado correctamente.');
          this.cancelar();
          this.cargar();
        },
        error: () => this.mensaje.set('Error al actualizar el docente.'),
      });
    } else {
      this.docenteService.crear(this.formulario).subscribe({
        next: () => {
          this.mensaje.set('Docente creado correctamente. Evento de docente emitido a RabbitMQ.');
          this.cancelar();
          this.cargar();
        },
        error: () => this.mensaje.set('Error al crear el docente.'),
      });
    }
  }

  eliminar(docente: Docente): void {
    this.docenteService.eliminar(docente.id).subscribe({
      next: () => {
        this.mensaje.set('Docente eliminado.');
        this.cargar();
      },
      error: () => this.mensaje.set('Error al eliminar el docente.'),
    });
  }
}