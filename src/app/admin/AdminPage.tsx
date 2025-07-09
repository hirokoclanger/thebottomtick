import AdminAuth from "./AdminAuth";

export default function AdminPage() {
  return (
    <div className="max-w-xl mx-auto py-12">
      <AdminAuth onAuth={() => {}} />
      {/* ...rest of the admin panel... */}
    </div>
  );
}
