import { Info, Settings2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Modal } from '@/components/common/Modal';
import { SideDrawer } from '@/components/common/SideDrawer';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AdmissionForm } from './AdmissionForm';
import { Section } from './Section';

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function OverlaysTab() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSubmitting, setDrawerSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [showGuardian, setShowGuardian] = useState(true);
  const [density, setDensity] = useState('comfortable');

  const handleConfirm = async () => {
    setConfirming(true);
    await sleep(800);
    setConfirming(false);
    setConfirmOpen(false);
    toast.success('Example record deleted');
  };

  return (
    <div className="space-y-10">
      <Section title="Modal and drawer" description="Both keep a fixed header and footer with a scrolling body. Footer buttons submit the form through its id.">
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setModalOpen(true)}>Open modal form</Button>
          <Button variant="outline" onClick={() => setDrawerOpen(true)}>
            Open drawer form
          </Button>
        </div>
      </Section>

      <Section title="Confirmation dialogs" description="Required for every destructive action. The caller controls loading and closing.">
        <div className="flex flex-wrap gap-3">
          <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
            Delete example record
          </Button>
          <Button variant="outline" onClick={() => setArchiveOpen(true)}>
            Archive example class
          </Button>
        </div>
      </Section>

      <Section title="Menus and hints">
        <div className="flex flex-wrap items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Settings2 aria-hidden="true" />
                View options
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuLabel>Columns</DropdownMenuLabel>
              <DropdownMenuCheckboxItem checked={showGuardian} onCheckedChange={setShowGuardian}>
                Guardian
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Density</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={density} onValueChange={setDensity}>
                <DropdownMenuRadioItem value="comfortable">Comfortable</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="compact">Compact</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Popover</Button>
            </PopoverTrigger>
            <PopoverContent className="space-y-2 text-sm">
              <p className="font-semibold">Short, contextual help</p>
              <p className="text-muted-foreground">Popovers hold small amounts of interactive or explanatory content next to the control that opened them.</p>
            </PopoverContent>
          </Popover>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="About tooltips">
                <Info aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Tooltips name icon-only controls</TooltipContent>
          </Tooltip>
        </div>
      </Section>

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Add student"
        description="Layout preview. Nothing is saved yet."
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={modalSubmitting}>
              Cancel
            </Button>
            <Button type="submit" form="admission-modal" disabled={modalSubmitting}>
              {modalSubmitting ? 'Checking…' : 'Check form'}
            </Button>
          </>
        }
      >
        <AdmissionForm formId="admission-modal" showSubmit={false} onSubmittingChange={setModalSubmitting} onSuccess={() => setModalOpen(false)} />
      </Modal>

      <SideDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="Add student"
        description="Layout preview. Nothing is saved yet."
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setDrawerOpen(false)} disabled={drawerSubmitting}>
              Cancel
            </Button>
            <Button type="submit" form="admission-drawer" disabled={drawerSubmitting}>
              {drawerSubmitting ? 'Checking…' : 'Check form'}
            </Button>
          </>
        }
      >
        <AdmissionForm formId="admission-drawer" showSubmit={false} onSubmittingChange={setDrawerSubmitting} onSuccess={() => setDrawerOpen(false)} />
      </SideDrawer>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this record?"
        description="This permanently removes the record and cannot be undone."
        confirmLabel="Delete record"
        destructive
        loading={confirming}
        onConfirm={handleConfirm}
      />

      <ConfirmDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        title="Archive this class?"
        description="Archived classes are hidden from timetables but keep their history. You can restore them later."
        confirmLabel="Archive class"
        onConfirm={() => {
          setArchiveOpen(false);
          toast.success('Class archived');
        }}
      />
    </div>
  );
}
