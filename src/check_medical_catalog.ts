import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ListSpecialtiesUseCase } from './modules/medical/application/use-cases/list-specialties.use-case';
import { ListServicesUseCase } from './modules/medical/application/use-cases/list-services.use-case';
import { ListMedicationsUseCase } from './modules/medical/application/use-cases/list-medications.use-case';
import { ListIcd10UseCase } from './modules/medical/application/use-cases/list-icd10.use-case';
import { SERVICE_PRICE_TYPE } from './common/constants/workflow.constants';

async function main() {
  console.log('🔄 Bootstrapping NestJS context for BA Verification...');
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const listSpecialtiesUseCase = app.get(ListSpecialtiesUseCase);
    const listServicesUseCase = app.get(ListServicesUseCase);
    const listMedicationsUseCase = app.get(ListMedicationsUseCase);
    const listIcd10UseCase = app.get(ListIcd10UseCase);

    console.log('\n--- 1. VERIFYING SPECIALTIES ---');
    const specialties = await listSpecialtiesUseCase.execute();
    console.log(`Total Specialties retrieved: ${specialties.length}`);
    console.table(specialties.map(s => ({ Code: s.code, Name: s.name, Active: s.isActive })));

    console.log('\n--- 2. VERIFYING SERVICES & PRICES ---');
    const services = await listServicesUseCase.execute();
    console.log(`Total Services retrieved: ${services.length}`);
    
    // Print first 15 services as samples
    const sampleServices = services.map(s => {
      const listed = s.prices?.find(p => p.priceType === SERVICE_PRICE_TYPE.LISTED)?.amount ?? 0;
      const insurance = s.prices?.find(p => p.priceType === SERVICE_PRICE_TYPE.INSURANCE)?.amount ?? 0;
      return {
        Code: s.code,
        Name: s.name,
        Category: s.category,
        Duration: `${s.durationMinutes} mins`,
        ListedPrice: `${listed.toLocaleString()} VND`,
        InsurancePrice: `${insurance.toLocaleString()} VND`,
        Active: s.isActive
      };
    });
    console.table(sampleServices.slice(0, 15));
    if (services.length > 15) {
      console.log(`... and ${services.length - 15} more services.`);
    }

    console.log('\n--- 3. VERIFYING MEDICATIONS ---');
    const medications = await listMedicationsUseCase.execute();
    console.log(`Total Medications retrieved: ${medications.length}`);
    console.table(medications.map(m => ({
      Code: m.code,
      Name: m.name,
      ActiveIngredient: m.activeIngredient,
      GroupName: m.groupName,
      Route: m.routeOfAdministration,
      MaxDose: m.maxDosePerDay
    })).slice(0, 15));
    if (medications.length > 15) {
      console.log(`... and ${medications.length - 15} more medications.`);
    }

    console.log('\n--- 4. VERIFYING ICD-10 CODES ---');
    const icd10Result = await listIcd10UseCase.execute(undefined, 1, 50);
    console.log(`Total ICD-10 Codes retrieved (page 1, limit 50): ${icd10Result.total}`);
    console.table(icd10Result.data.map(i => ({
      Code: i.code,
      Name: i.name,
      NameEn: i.nameEn,
      Active: i.isActive
    })).slice(0, 15));
    if (icd10Result.total > 15) {
      console.log(`... and ${icd10Result.total - 15} more ICD-10 codes.`);
    }

    // Assertions
    console.log('\n--- 5. BA ASSERTIONS RUN ---');
    const assertions = [
      { check: 'Specialties count >= 9', pass: specialties.length >= 9 },
      { check: 'Services count >= 35', pass: services.length >= 35 },
      { check: 'Medications count >= 10', pass: medications.length >= 10 },
      { check: 'ICD-10 count >= 10', pass: icd10Result.total >= 10 },
    ];
    console.table(assertions);
    
    const failed = assertions.some(a => !a.pass);
    if (failed) {
      console.error('❌ BA Verification FAILED: Some assertions did not pass!');
      process.exit(1);
    } else {
      console.log('✅ BA Verification SUCCESS: All assertions passed!');
    }

  } catch (error) {
    console.error('❌ Error during BA Verification:', error);
  } finally {
    await app.close();
  }
}

main();
