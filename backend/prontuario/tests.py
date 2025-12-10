"""
Testes de Permissão e Fluxo para o PhysioCapture
Rede de Clínicas com Multi-Filial e Transferência de Pacientes
"""

from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from authentication.models import Clinica, Filial, User
from prontuario.models import Patient, MedicalRecord, TreatmentPlan, PhysioSession, Discharge, PatientTransferHistory
from documentos.models import Document, DocumentCategory
from datetime import date, time


class MultiFilialBaseTestCase(TestCase):
    """Classe base para criar dados de teste com estrutura multi-filial"""
    
    def setUp(self):
        """Setup executado antes de cada teste"""
        # Criar clínica (Rede)
        self.clinica = Clinica.objects.create(
            nome="Rede FisioVida Teste",
            cnpj="00.000.000/0001-00",
            razao_social="FisioVida Teste LTDA",
            email="teste@fisiovida.com",
            telefone="(81) 99999-9999",
            endereco="Rua Teste",
            numero="123",
            bairro="Centro",
            cidade="Recife",
            estado="PE",
            cep="50000-000"
        )
        
        # Criar Filiais
        self.filial_recife = Filial.objects.create(
            clinica=self.clinica,
            nome="FisioVida Recife",
            endereco="Av. Boa Viagem",
            numero="100",
            bairro="Boa Viagem",
            cidade="Recife",
            estado="PE",
            cep="51020-000",
            telefone="(81) 3333-1001"
        )
        
        self.filial_olinda = Filial.objects.create(
            clinica=self.clinica,
            nome="FisioVida Olinda",
            endereco="Av. Beira Mar",
            numero="200",
            bairro="Carmo",
            cidade="Olinda",
            estado="PE",
            cep="53000-000",
            telefone="(81) 3333-2001"
        )
        
        # Criar Gestor Geral (acessa toda a rede)
        self.gestor_geral = User.objects.create_user(
            username="gestor_geral_test",
            email="gestor.geral@teste.com",
            password="senha123",
            first_name="Gestor",
            last_name="Geral",
            cpf="000.000.000-01",
            clinica=self.clinica,
            filial=None,  # Gestor Geral não tem filial
            user_type="GESTOR_GERAL"
        )
        
        # Criar Gestores de Filial
        self.gestor_recife = User.objects.create_user(
            username="gestor_recife_test",
            email="gestor.recife@teste.com",
            password="senha123",
            first_name="Gestor",
            last_name="Recife",
            cpf="100.000.000-01",
            clinica=self.clinica,
            filial=self.filial_recife,
            user_type="GESTOR_FILIAL"
        )
        
        self.gestor_olinda = User.objects.create_user(
            username="gestor_olinda_test",
            email="gestor.olinda@teste.com",
            password="senha123",
            first_name="Gestor",
            last_name="Olinda",
            cpf="200.000.000-01",
            clinica=self.clinica,
            filial=self.filial_olinda,
            user_type="GESTOR_FILIAL"
        )
        
        # Criar Fisioterapeutas
        self.fisio_recife_1 = User.objects.create_user(
            username="fisio_recife_1_test",
            email="fisio.recife.1@teste.com",
            password="senha123",
            first_name="Fisio",
            last_name="Recife 1",
            cpf="101.000.000-01",
            clinica=self.clinica,
            filial=self.filial_recife,
            user_type="FISIOTERAPEUTA",
            crefito="CREFITO-1/11111"
        )
        
        self.fisio_recife_2 = User.objects.create_user(
            username="fisio_recife_2_test",
            email="fisio.recife.2@teste.com",
            password="senha123",
            first_name="Fisio",
            last_name="Recife 2",
            cpf="102.000.000-01",
            clinica=self.clinica,
            filial=self.filial_recife,
            user_type="FISIOTERAPEUTA",
            crefito="CREFITO-1/22222"
        )
        
        self.fisio_olinda = User.objects.create_user(
            username="fisio_olinda_test",
            email="fisio.olinda@teste.com",
            password="senha123",
            first_name="Fisio",
            last_name="Olinda",
            cpf="201.000.000-01",
            clinica=self.clinica,
            filial=self.filial_olinda,
            user_type="FISIOTERAPEUTA",
            crefito="CREFITO-1/33333"
        )
        
        # Criar Pacientes
        self.paciente_recife_1 = Patient.objects.create(
            clinica=self.clinica,
            filial=self.filial_recife,
            fisioterapeuta=self.fisio_recife_1,
            full_name="Paciente Recife 1",
            cpf="301.000.000-01",
            birth_date=date(1990, 1, 1),
            gender="M",
            phone="(81) 98888-0001"
        )
        
        self.paciente_recife_2 = Patient.objects.create(
            clinica=self.clinica,
            filial=self.filial_recife,
            fisioterapeuta=self.fisio_recife_2,
            full_name="Paciente Recife 2",
            cpf="302.000.000-01",
            birth_date=date(1985, 5, 15),
            gender="F",
            phone="(81) 98888-0002"
        )
        
        self.paciente_olinda = Patient.objects.create(
            clinica=self.clinica,
            filial=self.filial_olinda,
            fisioterapeuta=self.fisio_olinda,
            full_name="Paciente Olinda",
            cpf="401.000.000-01",
            birth_date=date(1980, 10, 20),
            gender="M",
            phone="(81) 98888-0003"
        )


class UserRoleHierarchyTests(MultiFilialBaseTestCase):
    """Testes de verificação da hierarquia de usuários"""
    
    def test_gestor_geral_properties(self):
        """Verifica propriedades do Gestor Geral"""
        self.assertTrue(self.gestor_geral.is_gestor_geral)
        self.assertFalse(self.gestor_geral.is_gestor_filial)
        self.assertTrue(self.gestor_geral.is_gestor)
        self.assertFalse(self.gestor_geral.is_fisioterapeuta)
        self.assertIsNone(self.gestor_geral.filial)
    
    def test_gestor_filial_properties(self):
        """Verifica propriedades do Gestor de Filial"""
        self.assertFalse(self.gestor_recife.is_gestor_geral)
        self.assertTrue(self.gestor_recife.is_gestor_filial)
        self.assertTrue(self.gestor_recife.is_gestor)
        self.assertFalse(self.gestor_recife.is_fisioterapeuta)
        self.assertEqual(self.gestor_recife.filial, self.filial_recife)
    
    def test_fisioterapeuta_properties(self):
        """Verifica propriedades do Fisioterapeuta"""
        self.assertFalse(self.fisio_recife_1.is_gestor_geral)
        self.assertFalse(self.fisio_recife_1.is_gestor_filial)
        self.assertFalse(self.fisio_recife_1.is_gestor)
        self.assertTrue(self.fisio_recife_1.is_fisioterapeuta)
        self.assertEqual(self.fisio_recife_1.filial, self.filial_recife)


class FilialAccessPermissionTests(MultiFilialBaseTestCase):
    """Testes de permissão de acesso a filiais"""
    
    def test_gestor_geral_can_access_all_filiais(self):
        """Gestor Geral pode acessar todas as filiais"""
        self.assertTrue(self.gestor_geral.can_access_filial(self.filial_recife))
        self.assertTrue(self.gestor_geral.can_access_filial(self.filial_olinda))
    
    def test_gestor_filial_can_access_only_own_filial(self):
        """Gestor de Filial acessa apenas sua própria filial"""
        self.assertTrue(self.gestor_recife.can_access_filial(self.filial_recife))
        self.assertFalse(self.gestor_recife.can_access_filial(self.filial_olinda))
        
        self.assertTrue(self.gestor_olinda.can_access_filial(self.filial_olinda))
        self.assertFalse(self.gestor_olinda.can_access_filial(self.filial_recife))
    
    def test_fisioterapeuta_can_access_only_own_filial(self):
        """Fisioterapeuta acessa apenas sua própria filial"""
        self.assertTrue(self.fisio_recife_1.can_access_filial(self.filial_recife))
        self.assertFalse(self.fisio_recife_1.can_access_filial(self.filial_olinda))


class PatientAccessPermissionTests(MultiFilialBaseTestCase):
    """Testes de permissão de acesso a pacientes com multi-filial"""
    
    def test_gestor_geral_can_access_all_patients(self):
        """Gestor Geral pode acessar todos os pacientes da rede"""
        self.assertTrue(self.gestor_geral.can_access_patient(self.paciente_recife_1))
        self.assertTrue(self.gestor_geral.can_access_patient(self.paciente_recife_2))
        self.assertTrue(self.gestor_geral.can_access_patient(self.paciente_olinda))
    
    def test_gestor_filial_can_access_only_filial_patients(self):
        """Gestor de Filial acessa apenas pacientes da sua filial"""
        # Gestor Recife
        self.assertTrue(self.gestor_recife.can_access_patient(self.paciente_recife_1))
        self.assertTrue(self.gestor_recife.can_access_patient(self.paciente_recife_2))
        self.assertFalse(self.gestor_recife.can_access_patient(self.paciente_olinda))
        
        # Gestor Olinda
        self.assertFalse(self.gestor_olinda.can_access_patient(self.paciente_recife_1))
        self.assertTrue(self.gestor_olinda.can_access_patient(self.paciente_olinda))
    
    def test_fisio_can_access_only_own_patients(self):
        """Fisioterapeuta acessa apenas seus próprios pacientes"""
        self.assertTrue(self.fisio_recife_1.can_access_patient(self.paciente_recife_1))
        self.assertFalse(self.fisio_recife_1.can_access_patient(self.paciente_recife_2))
        self.assertFalse(self.fisio_recife_1.can_access_patient(self.paciente_olinda))


class PatientTransferPermissionTests(MultiFilialBaseTestCase):
    """Testes de permissão de transferência de pacientes"""
    
    def test_gestor_geral_can_transfer_any_patient(self):
        """Gestor Geral pode transferir qualquer paciente"""
        self.assertTrue(self.gestor_geral.can_transfer_patient(self.paciente_recife_1))
        self.assertTrue(self.gestor_geral.can_transfer_patient(self.paciente_olinda))
    
    def test_gestor_filial_can_transfer_filial_patients(self):
        """Gestor de Filial pode transferir pacientes da sua filial"""
        self.assertTrue(self.gestor_recife.can_transfer_patient(self.paciente_recife_1))
        self.assertFalse(self.gestor_recife.can_transfer_patient(self.paciente_olinda))
    
    def test_fisio_can_transfer_own_patients_intra_filial(self):
        """Fisioterapeuta pode transferir seus pacientes (intra-filial)"""
        self.assertTrue(self.fisio_recife_1.can_transfer_patient(self.paciente_recife_1))
        self.assertFalse(self.fisio_recife_1.can_transfer_patient(self.paciente_recife_2))
    
    def test_fisio_cannot_transfer_inter_filial(self):
        """Fisioterapeuta não pode transferir para outra filial"""
        self.assertFalse(
            self.fisio_recife_1.can_transfer_patient(
                self.paciente_recife_1, 
                to_filial=self.filial_olinda
            )
        )


class PatientTransferTests(MultiFilialBaseTestCase):
    """Testes de transferência de pacientes"""
    
    def test_transfer_paciente_intra_filial(self):
        """Testa transferência de paciente dentro da mesma filial"""
        old_fisio = self.paciente_recife_1.fisioterapeuta
        
        self.paciente_recife_1.transfer_to(
            new_fisioterapeuta=self.fisio_recife_2,
            reason="Mudança de horário",
            transferred_by=self.gestor_recife
        )
        
        self.paciente_recife_1.refresh_from_db()
        
        # Verificar transferência
        self.assertEqual(self.paciente_recife_1.fisioterapeuta, self.fisio_recife_2)
        self.assertEqual(self.paciente_recife_1.filial, self.filial_recife)  # Mesma filial
        
        # Verificar histórico
        history = PatientTransferHistory.objects.filter(patient=self.paciente_recife_1).first()
        self.assertIsNotNone(history)
        self.assertEqual(history.from_fisioterapeuta, old_fisio)
        self.assertEqual(history.to_fisioterapeuta, self.fisio_recife_2)
        self.assertEqual(history.reason, "Mudança de horário")
    
    def test_transfer_paciente_inter_filial(self):
        """Testa transferência de paciente entre filiais"""
        old_fisio = self.paciente_recife_1.fisioterapeuta
        old_filial = self.paciente_recife_1.filial
        
        self.paciente_recife_1.transfer_to(
            new_fisioterapeuta=self.fisio_olinda,
            reason="Paciente mudou para Olinda",
            transferred_by=self.gestor_geral
        )
        
        self.paciente_recife_1.refresh_from_db()
        
        # Verificar transferência
        self.assertEqual(self.paciente_recife_1.fisioterapeuta, self.fisio_olinda)
        self.assertEqual(self.paciente_recife_1.filial, self.filial_olinda)  # Nova filial
        
        # Verificar histórico
        history = PatientTransferHistory.objects.filter(patient=self.paciente_recife_1).first()
        self.assertIsNotNone(history)
        self.assertEqual(history.from_filial, old_filial)
        self.assertEqual(history.to_filial, self.filial_olinda)
    
    def test_transfer_history_is_recorded(self):
        """Testa que o histórico de transferência é registrado corretamente"""
        # Realizar múltiplas transferências
        self.paciente_recife_1.transfer_to(
            new_fisioterapeuta=self.fisio_recife_2,
            reason="Primeira transferência",
            transferred_by=self.gestor_recife
        )
        
        self.paciente_recife_1.transfer_to(
            new_fisioterapeuta=self.fisio_olinda,
            reason="Segunda transferência",
            transferred_by=self.gestor_geral
        )
        
        # Verificar histórico
        history = PatientTransferHistory.objects.filter(patient=self.paciente_recife_1).order_by('-transfer_date')
        self.assertEqual(history.count(), 2)
        
        # Última transferência
        self.assertEqual(history[0].reason, "Segunda transferência")
        # Primeira transferência
        self.assertEqual(history[1].reason, "Primeira transferência")


class UserManagementPermissionTests(MultiFilialBaseTestCase):
    """Testes de permissão para gerenciamento de usuários"""
    
    def test_gestor_geral_can_manage_all_users(self):
        """Gestor Geral pode gerenciar todos os usuários da rede"""
        self.assertTrue(self.gestor_geral.can_manage_user(self.gestor_recife))
        self.assertTrue(self.gestor_geral.can_manage_user(self.fisio_recife_1))
        self.assertTrue(self.gestor_geral.can_manage_user(self.fisio_olinda))
    
    def test_gestor_filial_can_manage_only_filial_users(self):
        """Gestor de Filial pode gerenciar apenas usuários da sua filial"""
        self.assertTrue(self.gestor_recife.can_manage_user(self.fisio_recife_1))
        self.assertTrue(self.gestor_recife.can_manage_user(self.fisio_recife_2))
        self.assertFalse(self.gestor_recife.can_manage_user(self.fisio_olinda))
