import { Send } from 'lucide-react';
import MPINVerificationDialog from '@/components/MPINVerificationDialog';
import { MoneyTransferForm } from '@/components/transfers/MoneyTransferForm';
import { PayLoanDialog } from '@/components/transfers/PayLoanDialog';
import { ManageFDDialog } from '@/components/transfers/ManageFDDialog';
import { ManageRDDialog } from '@/components/transfers/ManageRDDialog';
import { BalanceUser } from '@/components/user/online-transfer/AccountSummary';

interface DialogsProps {
  user: BalanceUser;
  showMPINDialog: boolean;
  setShowMPINDialog: React.Dispatch<React.SetStateAction<boolean>>;
  showTransferForm: boolean;
  setShowTransferForm: React.Dispatch<React.SetStateAction<boolean>>;
  showPayLoanDialog: boolean;
  setShowPayLoanDialog: React.Dispatch<React.SetStateAction<boolean>>;
  showManageFDDialog: boolean;
  setShowManageFDDialog: React.Dispatch<React.SetStateAction<boolean>>;
  showManageRDDialog: boolean;
  setShowManageRDDialog: React.Dispatch<React.SetStateAction<boolean>>;
  initialRecipient: string;
  setInitialRecipient: React.Dispatch<React.SetStateAction<string>>;
  actionLoading: boolean;
  handleMPINVerify: (mpin: string) => Promise<boolean>;
  handleTransferFormSubmit: (toUserName: string, amount: number) => void;
  handlePayLoan: (amount: number) => Promise<void>;
  handleTransferToFD: (amount: number) => Promise<void>;
  handleWithdrawFromFD: (amount: number) => Promise<void>;
  handleCreateRD: (
    monthlyAmount: number,
    tenureMonths: number
  ) => Promise<void>;
  transferMaxAmount: number;
}

export function OnlineTransferDialogs({
  user,
  showMPINDialog,
  setShowMPINDialog,
  showTransferForm,
  setShowTransferForm,
  showPayLoanDialog,
  setShowPayLoanDialog,
  showManageFDDialog,
  setShowManageFDDialog,
  showManageRDDialog,
  setShowManageRDDialog,
  initialRecipient,
  setInitialRecipient,
  actionLoading,
  handleMPINVerify,
  handleTransferFormSubmit,
  handlePayLoan,
  handleTransferToFD,
  handleWithdrawFromFD,
  handleCreateRD,
  transferMaxAmount,
}: DialogsProps) {
  return (
    <>
      <MPINVerificationDialog
        isOpen={showMPINDialog}
        onClose={() => {
          setShowMPINDialog(false);
        }}
        onVerify={handleMPINVerify}
        isLoading={actionLoading}
      />

      <MoneyTransferForm
        key={`${showTransferForm}-${initialRecipient}`}
        open={showTransferForm}
        onOpenChange={(open) => {
          setShowTransferForm(open);
          if (!open) setInitialRecipient('');
        }}
        loading={actionLoading}
        onSubmit={handleTransferFormSubmit}
        title="Direct Transfer"
        description="Enter recipient details to send money"
        icon={<Send size={20} />}
        maxAmount={transferMaxAmount}
        initialRecipient={initialRecipient}
      />

      <PayLoanDialog
        open={showPayLoanDialog}
        onOpenChange={setShowPayLoanDialog}
        loading={actionLoading}
        onSubmit={handlePayLoan}
        maxAmount={user.savingsBalance || 0}
        loanBalance={user.loanBalance || 0}
      />

      <ManageFDDialog
        open={showManageFDDialog}
        onOpenChange={setShowManageFDDialog}
        loading={actionLoading}
        onTransferToFD={handleTransferToFD}
        onWithdrawFromFD={handleWithdrawFromFD}
        savingsBalance={user.savingsBalance || 0}
        fdBalance={user.fd || 0}
      />

      <ManageRDDialog
        open={showManageRDDialog}
        onOpenChange={setShowManageRDDialog}
        loading={actionLoading}
        onCreateRD={handleCreateRD}
        savingsBalance={user.savingsBalance || 0}
        rdBalance={user.rd || 0}
      />
    </>
  );
}
