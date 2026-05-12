import { Tabs } from "expo-router";
import { useAuthStore } from "@/src/store/auth.store";
import FontAwesome from "@expo/vector-icons/FontAwesome";

function Icon(props: { name: React.ComponentProps<typeof FontAwesome>["name"]; color: string }) {
  return <FontAwesome size={22} {...props} />;
}

export default function TabsLayout() {
  const usuario = useAuthStore((s) => s.usuario);
  const isAdmin = usuario?.id_rol === 1;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: { backgroundColor: "#fff", borderTopColor: "#e5e7eb" },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <Icon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="clientes"
        options={{
          title: "Clientes",
          tabBarIcon: ({ color }) => <Icon name="users" color={color} />,
        }}
      />
      <Tabs.Screen
        name="proyectos"
        options={{
          title: "Proyectos",
          tabBarIcon: ({ color }) => <Icon name="briefcase" color={color} />,
        }}
      />
      <Tabs.Screen
        name="tareas"
        options={{
          title: "Tareas",
          tabBarIcon: ({ color }) => <Icon name="check-square" color={color} />,
        }}
      />
      <Tabs.Screen
        name="usuarios"
        options={{
          title: "Usuarios",
          tabBarIcon: ({ color }) => <Icon name="user-circle" color={color} />,
          href: isAdmin ? undefined : null,
        }}
      />
    </Tabs>
  );
}
