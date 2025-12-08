"""
Testes de Permissão e Fluxo para o PhysioCapture
Fase 3 - Base sólida de testes automatizados
"""

from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from authentication.models import Clinica, User
from prontuario.models import Patient, MedicalRecord, TreatmentPlan, PhysioSession, Discharge
from documentos.models import Document, DocumentCategory
from datetime import date, time


class BaseTestCase(TestCase):
    """Classe base para criar dados de teste comuns"""
    
    def setUp(self):
        """Setup executado antes de cada teste"""
        # Criar clínica
        self.clinica = Clinica.objects.create(
            nome="Clínica Teste",
            cnpj="00.000.000/0001-00",
            razao_social="Clínica Teste LTDA",
            email="clinica@teste.com",
            telefone="(11) 99999-9999",
            endereco="Rua Teste",
            numero="123",
            bairro="Centro",
            cidade="São Paulo",
            estado="SP",
            cep="01000-000"
        )
        
        # Criar usuários
        self.gestor = User.objects.create_user(
            username="gestor_test",
            email="gestor@teste.com",
            password="senha123",
            first_name="Gestor",
            last_name="Teste",
            cpf="111.111.111-11",
            clinica=self.clinica,
            user_type="GESTOR"
        )
        
        self.fisio1 = User.objects.create_user(
            username="fisio1_test",
            email="fisio1@teste.com",
            password="senha123",
            first_name="Fisio",
            last_name="Um",
            cpf="222.222.222-22",
            clinica=self.clinica,
            user_type="FISIOTERAPEUTA",
            crefito="CREFITO-1/12345"
        )
        
        self.fisio2 = User.objects.create_user(
            username="fisio2_test",
            email="fisio2@teste.com",
            password="senha123",
            first_name="Fisio",
            last_name="Dois",
            cpf="333.333.333-33",
            clinica=self.clinica,
            user_type="FISIOTERAPEUTA",
            crefito="CREFITO-1/67890"
        )
        
        self.atendente = User.objects.create_user(
            username="atendente_test",
            email="atendente@teste.com",
            password="senha123",
            first_name="Atendente",
            last_name="Teste",
            cpf="444.444.444-44",
            clinica=self.clinica,
            user_type="ATENDENTE"
        )
        
        # Criar pacientes
        self.paciente_fisio1 = Patient.objects.create(
            clinica=self.clinica,
            fisioterapeuta=self.fisio1,
            full_name="Paciente do Fisio 1",
            cpf="555.555.555-55",
            birth_date=date(1990, 1, 1),
            gender="M",
            phone="(11) 98888-8888"
        )
        
        self.paciente_fisio2 = Patient.objects.create(
            clinica=self.clinica,
            fisioterapeuta=self.fisio2,
            full_name="Paciente do Fisio 2",
            cpf="666.666.666-66",
            birth_date=date(1985, 5, 15),
            gender="F",
            phone="(11) 97777-7777"
        )


class UserRolePermissionsTests(BaseTestCase):
    """Testes de verificação de papéis e permissões do modelo User"""
    
    def test_gestor_is_gestor_property(self):
        """Verifica que is_gestor retorna True para gestor"""
        self.assertTrue(self.gestor.is_gestor)
        self.assertFalse(self.gestor.is_fisioterapeuta)
        self.assertFalse(self.gestor.is_atendente)
    
    def test_fisioterapeuta_is_fisioterapeuta_property(self):
        """Verifica que is_fisioterapeuta retorna True para fisio"""
        self.assertTrue(self.fisio1.is_fisioterapeuta)
        self.assertFalse(self.fisio1.is_gestor)
        self.assertFalse(self.fisio1.is_atendente)
    
    def test_atendente_is_atendente_property(self):
        """Verifica que is_atendente retorna True para atendente"""
        self.assertTrue(self.atendente.is_atendente)
        self.assertFalse(self.atendente.is_gestor)
        self.assertFalse(self.atendente.is_fisioterapeuta)
    
    def test_gestor_can_manage_users(self):
        """Apenas gestor pode gerenciar usuários"""
        self.assertTrue(self.gestor.can_manage_users())
        self.assertFalse(self.fisio1.can_manage_users())
        self.assertFalse(self.atendente.can_manage_users())
    
    def test_gestor_and_fisio_can_access_clinical_data(self):
        """Gestor e fisio podem acessar dados clínicos"""
        self.assertTrue(self.gestor.can_access_clinical_data())
        self.assertTrue(self.fisio1.can_access_clinical_data())
        self.assertFalse(self.atendente.can_access_clinical_data())
    
    def test_gestor_and_atendente_can_manage_schedule(self):
        """Gestor e atendente podem gerenciar agenda"""
        self.assertTrue(self.gestor.can_manage_schedule())
        self.assertTrue(self.atendente.can_manage_schedule())
        self.assertFalse(self.fisio1.can_manage_schedule())
    
    def test_only_gestor_can_manage_inventory(self):
        """Apenas gestor pode gerenciar estoque"""
        self.assertTrue(self.gestor.can_manage_inventory())
        self.assertFalse(self.fisio1.can_manage_inventory())
        self.assertFalse(self.atendente.can_manage_inventory())
    
    def test_only_gestor_can_view_reports(self):
        """Apenas gestor pode ver relatórios globais"""
        self.assertTrue(self.gestor.can_view_reports())
        self.assertFalse(self.fisio1.can_view_reports())
        self.assertFalse(self.atendente.can_view_reports())


class PatientAccessPermissionsTests(BaseTestCase):
    """Testes de permissão de acesso a pacientes"""
    
    def test_gestor_can_access_all_patients(self):
        """Gestor pode acessar todos os pacientes da clínica"""
        self.assertTrue(self.gestor.can_access_patient(self.paciente_fisio1))
        self.assertTrue(self.gestor.can_access_patient(self.paciente_fisio2))
    
    def test_fisio_can_access_only_own_patients(self):
        """Fisioterapeuta acessa apenas seus próprios pacientes"""
        # Fisio1 acessa seu paciente
        self.assertTrue(self.fisio1.can_access_patient(self.paciente_fisio1))
        # Fisio1 NÃO acessa paciente do Fisio2
        self.assertFalse(self.fisio1.can_access_patient(self.paciente_fisio2))
        # Fisio2 acessa seu paciente
        self.assertTrue(self.fisio2.can_access_patient(self.paciente_fisio2))
        # Fisio2 NÃO acessa paciente do Fisio1
        self.assertFalse(self.fisio2.can_access_patient(self.paciente_fisio1))
    
    def test_atendente_can_access_all_patients_basic_data(self):
        """Atendente pode acessar dados básicos de todos os pacientes"""
        self.assertTrue(self.atendente.can_access_patient(self.paciente_fisio1))
        self.assertTrue(self.atendente.can_access_patient(self.paciente_fisio2))
    
    def test_atendente_cannot_access_clinical_data(self):
        """Atendente NÃO pode acessar dados clínicos"""
        self.assertFalse(self.atendente.can_access_patient_clinical_data(self.paciente_fisio1))
        self.assertFalse(self.atendente.can_access_patient_clinical_data(self.paciente_fisio2))
    
    def test_gestor_can_access_clinical_data_of_all_patients(self):
        """Gestor pode acessar dados clínicos de todos os pacientes"""
        self.assertTrue(self.gestor.can_access_patient_clinical_data(self.paciente_fisio1))
        self.assertTrue(self.gestor.can_access_patient_clinical_data(self.paciente_fisio2))
    
    def test_fisio_can_access_clinical_data_of_own_patients(self):
        """Fisio pode acessar dados clínicos apenas dos seus pacientes"""
        self.assertTrue(self.fisio1.can_access_patient_clinical_data(self.paciente_fisio1))
        self.assertFalse(self.fisio1.can_access_patient_clinical_data(self.paciente_fisio2))


class SessionFlowTests(BaseTestCase):
    """Testes de fluxo de sessões de fisioterapia"""
    
    def setUp(self):
        super().setUp()
        # Criar plano de tratamento
        self.plano = TreatmentPlan.objects.create(
            patient=self.paciente_fisio1,
            fisioterapeuta=self.fisio1,
            clinica=self.clinica,
            title="Plano de Reabilitação",
            objectives="Recuperar amplitude de movimento",
            total_sessions=10,
            frequency="2x_semana",
            start_date=date.today()
        )
    
    def test_create_physio_session(self):
        """Testa criação de sessão de fisioterapia"""
        session = PhysioSession.objects.create(
            patient=self.paciente_fisio1,
            fisioterapeuta=self.fisio1,
            clinica=self.clinica,
            treatment_plan=self.plano,
            scheduled_date=date.today(),
            scheduled_time=time(9, 0),
            session_number=1,
            status="AGENDADA",
            created_by=self.fisio1
        )
        
        self.assertEqual(session.status, "AGENDADA")
        self.assertEqual(session.session_number, 1)
        self.assertTrue(session.can_be_edited)
    
    def test_session_status_transitions(self):
        """Testa transições de status da sessão"""
        session = PhysioSession.objects.create(
            patient=self.paciente_fisio1,
            fisioterapeuta=self.fisio1,
            clinica=self.clinica,
            scheduled_date=date.today(),
            scheduled_time=time(10, 0),
            status="AGENDADA",
            created_by=self.atendente
        )
        
        # Confirmar sessão
        session.status = "CONFIRMADA"
        session.save()
        self.assertTrue(session.can_be_edited)
        
        # Realizar sessão
        session.status = "REALIZADA"
        session.procedures = "Exercícios de alongamento"
        session.evolution = "Paciente apresentou melhora"
        session.save()
        self.assertFalse(session.can_be_edited)
    
    def test_treatment_plan_progress(self):
        """Testa cálculo de progresso do plano de tratamento"""
        # Sem sessões realizadas
        self.assertEqual(self.plano.completed_sessions_count, 0)
        self.assertEqual(self.plano.progress_percentage, 0)
        
        # Criar 3 sessões realizadas
        for i in range(3):
            PhysioSession.objects.create(
                patient=self.paciente_fisio1,
                fisioterapeuta=self.fisio1,
                clinica=self.clinica,
                treatment_plan=self.plano,
                scheduled_date=date.today(),
                scheduled_time=time(9 + i, 0),
                session_number=i + 1,
                status="REALIZADA",
                created_by=self.fisio1
            )
        
        # Refresh do plano
        self.plano.refresh_from_db()
        self.assertEqual(self.plano.completed_sessions_count, 3)
        self.assertEqual(self.plano.progress_percentage, 30)  # 3/10 = 30%


class DischargeTests(BaseTestCase):
    """Testes de alta/encerramento"""
    
    def test_create_discharge(self):
        """Testa criação de registro de alta"""
        discharge = Discharge.objects.create(
            patient=self.paciente_fisio1,
            fisioterapeuta=self.fisio1,
            clinica=self.clinica,
            reason="MELHORA",
            discharge_date=date.today(),
            final_evaluation="Paciente recuperou completamente a amplitude de movimento"
        )
        
        self.assertEqual(discharge.reason, "MELHORA")
        self.assertEqual(discharge.get_reason_display(), "Alta por Melhora")
