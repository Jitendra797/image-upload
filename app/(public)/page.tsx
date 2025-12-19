import { ProfileAvatarUpload } from '@/components/profile-avatar-upload';

export default function Home() {
  return (
    <>
      <div className="flex flex-col gap-4 min-h-screen justify-center items-center p-4">
        <h1 className="text-4xl font-bold">devsForFun</h1>
        <p className="text-muted-foreground">opensource frontend template</p>
        <ProfileAvatarUpload size="xl" />
      </div>
    </>
  );
}
