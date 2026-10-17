import type { JSX } from "react";
import type { MeScreen } from "@/@types/me";
import { PageHeader } from "@/components/page-header";
import { SearchInput } from "@/components/search-input";
import { SCREEN_KEYS } from "@/constants/screens";
import { useMeScreen } from "@/hooks/use-me-screen";
import { BagDrawer } from "./components/bag";
import { CartBar } from "./components/cart-bar";
import { CategoryChips } from "./components/category-chips";
import { MenuSections } from "./components/menu-sections";
import { MenuEmpty, MenuLoadError, MenuNoResults, MenuSkeleton } from "./components/menu-states";
import { MENU_MESSAGES } from "./constants/messages";
import { useBag } from "./hooks/use-bag";
import { useCart } from "./hooks/use-cart";
import { useCartQuote } from "./hooks/use-cart-quote";
import { useMenu } from "./hooks/use-menu";
import type { BagModel, CartModel, CartQuoteModel, MenuModel } from "./types";

interface MenuBodyProps {
  menu: MenuModel;
  cart: CartModel;
}

function MenuBody({ menu, cart }: MenuBodyProps): JSX.Element {
  if (menu.loading) {
    return <MenuSkeleton />;
  }
  if (menu.loadError !== null) {
    return <MenuLoadError detail={menu.loadError} />;
  }
  if (menu.categories.length === 0) {
    return <MenuEmpty />;
  }
  if (menu.sections.length === 0) {
    return <MenuNoResults onClear={menu.actions.clearSearch} />;
  }
  return <MenuSections sections={menu.sections} canOrder={cart.canOrder} onAdd={cart.add} />;
}

export function MenuScreen(): JSX.Element {
  const screen: MeScreen | undefined = useMeScreen(SCREEN_KEYS.STORE_MENU);
  const menu: MenuModel = useMenu();
  const cart: CartModel = useCart();
  const quote: CartQuoteModel = useCartQuote(cart.items);
  const bag: BagModel = useBag(cart, quote, menu.productNames);
  const showsCartBar: boolean = cart.canOrder && cart.count > 0;

  return (
    <>
      <PageHeader title={screen?.label} />
      <section
        data-cart-bar={showsCartBar}
        className="flex flex-1 flex-col gap-4 px-4 pb-8 data-[cart-bar=true]:pb-28 md:px-8"
      >
        <SearchInput
          label={MENU_MESSAGES.SEARCH}
          value={menu.filter.search}
          onValueChange={menu.actions.changeSearch}
          className="md:max-w-md"
        />
        {menu.categories.length > 0 && (
          <CategoryChips
            chips={menu.chips}
            selected={menu.filter.categoryId}
            onSelect={menu.actions.chooseCategory}
          />
        )}
        <MenuBody menu={menu} cart={cart} />
      </section>
      {showsCartBar && <CartBar count={cart.count} quote={quote} onOpen={bag.show} />}
      {cart.canOrder && <BagDrawer bag={bag} cart={cart} quote={quote} />}
    </>
  );
}
