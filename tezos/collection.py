import smartpy as sp
from templates import fa2_lib as fa2
from templates import fa2_lib_testing as testing

main = fa2.main

@sp.add_test(name="Fungible", is_default=True)
def test():
    administrator = sp.address("tz1NukWgsw89MAb254g8kc5M8J9CmDs2e3Lo")
    alice = sp.test_account("Alice")
    tok0_md = fa2.make_metadata(name="Token Zero", decimals=1, symbol="Tok0")
    tok1_md = fa2.make_metadata(name="Token One", decimals=1, symbol="Tok1")
    tok2_md = fa2.make_metadata(name="Token Two", decimals=1, symbol="Tok2")
    TOKEN_METADATA = [tok0_md, tok1_md, tok2_md]
    METADATA = sp.utils.metadata_of_url("https://artcrowd.org/collection_meta.json")
    ledger = {
        #(alice.address, 0): 42,
        #(alice.address, 1): 42,
        #(alice.address, 2): 42,
    }
    token_metadata = []#TOKEN_METADATA

    # Default Fungible
    c1 = m.ArtcrowdCollection(
        administrator=administrator,#.address,
        metadata=METADATA,
        ledger=ledger,
        token_metadata=token_metadata,
    )
    kwargs = {"modules": [fa2.t, fa2.main, m], "ledger_type": "Fungible1"}

    sc = sp.test_scenario([fa2.t, main, m])
    sc += c1
    # Standard features
    return
    testing.test_core_interfaces(c1, **kwargs)
    testing.test_transfer(c1, **kwargs)
    testing.test_balance_of(c1, **kwargs)
    # Policies
    testing.test_owner_or_operator_transfer(c1, **kwargs)

    # Non standard features
    testing.NS.test_admin(None, **kwargs)
    testing.NS.test_mint(c1, **kwargs)
    testing.NS.test_burn(c1, supports_transfer=True, supports_operator=True, **kwargs)
    testing.NS.test_withdraw_mutez(c1, **kwargs)
    testing.NS.test_change_metadata(c1, **kwargs)
    testing.NS.test_get_balance_of(c1, **kwargs)

@sp.module
def m():
    class ArtcrowdCollection(
        main.Admin,
        main.Fungible,
        main.ChangeMetadata,
        main.WithdrawMutez,
        main.MintFungible,
        main.BurnFungible,
        main.OffchainviewTokenMetadata,
        main.OnchainviewBalanceOf,
    ):
        def __init__(self, administrator, metadata, ledger, token_metadata):
            main.OnchainviewBalanceOf.__init__(self)
            main.OffchainviewTokenMetadata.__init__(self)
            main.BurnFungible.__init__(self)
            main.MintFungible.__init__(self)
            main.WithdrawMutez.__init__(self)
            main.ChangeMetadata.__init__(self)
            main.Fungible.__init__(self, metadata, ledger, token_metadata)
            main.Admin.__init__(self, administrator)