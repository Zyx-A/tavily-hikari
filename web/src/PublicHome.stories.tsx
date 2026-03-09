import { useState } from 'react'
import { Icon } from '@iconify/react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import PublicHomeHeroCard from './components/PublicHomeHeroCard'
import LanguageSwitcher from './components/LanguageSwitcher'
import ThemeToggle from './components/ThemeToggle'
import { Button } from './components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './components/ui/dialog'
import { Input } from './components/ui/input'
import { useTranslate } from './i18n'

type CopyState = 'idle' | 'copied' | 'error'

interface PublicHomeStoryArgs {
  showAdminAction: boolean
  defaultViewport: string
}

function PublicHomeStoryCanvas(args: PublicHomeStoryArgs): JSX.Element {
  const strings = useTranslate().public
  const [tokenDraft, setTokenDraft] = useState('th-storybook-demo-token')
  const [tokenVisible, setTokenVisible] = useState(false)
  const [copyState, setCopyState] = useState<CopyState>('idle')
  const [isDialogOpen, setIsDialogOpen] = useState(true)

  const copyToken = async () => {
    const next = tokenDraft.trim()
    if (!next) return
    try {
      await navigator.clipboard.writeText(next)
      setCopyState('copied')
      window.setTimeout(() => setCopyState('idle'), 1500)
    } catch {
      setCopyState('error')
      window.setTimeout(() => setCopyState('idle'), 1500)
    }
  }

  return (
    <main className="app-shell public-home">
      <PublicHomeHeroCard
        publicStrings={strings}
        loading={false}
        metrics={{ monthlySuccess: 1240, dailySuccess: 87 }}
        availableKeys={7}
        totalKeys={12}
        error={null}
        showLinuxDoLogin
        showTokenAccessButton
        showAdminAction={args.showAdminAction}
        adminActionLabel={strings.adminLoginButton}
        topControls={(
          <>
            <ThemeToggle />
            <LanguageSwitcher />
          </>
        )}
      />
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="token-access-modal modal-box max-w-2xl [&>button]:hidden">
          <DialogHeader>
            <DialogTitle>{strings.tokenAccess.dialog.title}</DialogTitle>
            <DialogDescription className="opacity-80">
              {strings.tokenAccess.dialog.description}
            </DialogDescription>
          </DialogHeader>
          <div className="token-input-wrapper" style={{ marginTop: 14 }}>
            <label htmlFor="story-token-input" className="token-label">
              {strings.accessToken.label}
            </label>
            <div className="token-input-row">
              <div className="token-input-shell">
                <Input
                  id="story-token-input"
                  name="not-a-login-field"
                  className={`token-input${tokenVisible ? '' : ' masked'}`}
                  type="text"
                  value={tokenDraft}
                  onChange={(event) => setTokenDraft(event.target.value)}
                  placeholder={strings.accessToken.placeholder}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  aria-autocomplete="none"
                  inputMode="text"
                  data-1p-ignore="true"
                  data-lpignore="true"
                  data-form-type="other"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="token-visibility-button"
                  onClick={() => setTokenVisible((prev) => !prev)}
                  aria-label={tokenVisible ? strings.accessToken.toggle.hide : strings.accessToken.toggle.show}
                >
                  <Icon
                    icon={tokenVisible ? 'mdi:eye-off-outline' : 'mdi:eye-outline'}
                    width={22}
                    height={22}
                    aria-hidden="true"
                  />
                </Button>
              </div>
              <Button
                type="button"
                variant={copyState === 'copied' ? 'success' : copyState === 'error' ? 'warning' : 'outline'}
                className="token-copy-button"
                data-copy-state={copyState === 'idle' ? undefined : copyState}
                onClick={() => void copyToken()}
                disabled={tokenDraft.trim().length === 0}
              >
                <Icon
                  icon={
                    copyState === 'copied'
                      ? 'mdi:check'
                      : copyState === 'error'
                        ? 'mdi:alert-circle-outline'
                        : 'mdi:content-copy'
                  }
                  aria-hidden="true"
                  className="token-copy-icon"
                />
                <span>
                  {copyState === 'copied'
                    ? strings.copyToken.copied
                    : copyState === 'error'
                      ? strings.copyToken.error
                      : strings.copyToken.copy}
                </span>
              </Button>
            </div>
          </div>
          <p className="opacity-80" style={{ marginTop: 14, marginBottom: 0 }}>
            {strings.tokenAccess.dialog.loginHint}{' '}
            <a href="/auth/linuxdo" className="link">
              {strings.linuxDoLogin.button}
            </a>
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              {strings.tokenAccess.dialog.actions.cancel}
            </Button>
            <Button type="button" disabled={tokenDraft.trim().length === 0}>
              {strings.tokenAccess.dialog.actions.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}

const meta = {
  title: 'Public/PublicHome',
  component: PublicHomeStoryCanvas,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Public home fixture covering the shadcn token access path: hero actions, controlled `Input`, `Button`-based copy and visibility actions, plus the Radix `Dialog` shell used by the production flow.',
      },
    },
  },
  render: (args) => <PublicHomeStoryCanvas {...args} />,
} satisfies Meta<typeof PublicHomeStoryCanvas>

export default meta

type Story = StoryObj<typeof meta>

export const TokenAccessDesktop: Story = {
  args: {
    showAdminAction: false,
    defaultViewport: '1440-device-desktop',
  },
  parameters: {
    viewport: { defaultViewport: '1440-device-desktop' },
    docs: {
      description: {
        story: 'Desktop state with the token dialog already open so keyboard focus, copy feedback, and password-manager escape attributes can be reviewed quickly.',
      },
    },
  },
}

export const TokenAccessMobile: Story = {
  args: {
    showAdminAction: true,
    defaultViewport: '0390-device-iphone-14',
  },
  parameters: {
    viewport: { defaultViewport: '0390-device-iphone-14' },
    docs: {
      description: {
        story: 'Mobile-width variant that keeps the same shadcn dialog controls while exposing the admin CTA alongside the hero card actions.',
      },
    },
  },
}
