// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.33
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["为新时代中俄关系提供战略引领", "央行降准又降息意味着什么", "外交部：这次会谈是应美方请求举行的", "2025“五一”假期盘点", "“我不会跑 我是张纪中”", "中国对印度部分加征关税释放2个信号", "小心馅饼变陷阱 警方提醒", "#巴基斯坦何以击落多架印军战机#", "林俊杰被曝介入他人感情 公司回应", "走过莫斯科街头的“中国排面”", "明星同款撕拉片为何爆火", "斗牛比赛现场冲突致人死亡？不实", "美财长被问中美谁主动时紧张到结巴", "印军被曝在实控线附近升起白旗", "上海高架一司机把脚伸出窗外开车", "俄方宣布普京将于8月底访华", "张艺兴官宣茅台文旅代言人引争议", "中方外交部回应印巴局势升级", "《刑警的日子》高亚麟被曝遭换脸", "人民网：胖东来需讨回公道", "巴方称已击落6架印度战机", "安徽13岁男孩五一回老家失联5天", "女子吃饭两瓶矿泉水被收176元", "专家：降准降息更利好于首次购房人群", "郑州又“变大”了", "王欣瑜止步WTA1000罗马站首轮", "本次降准降息或不会催生大牛市", "周渝民罕见谈大S", "全红婵成“带货女王”", "女子用公筷试吃超市咸菜后插回", "女孩肚痛查出卵巢像麻花一样扭了4圈", "医院回应子宫相关论文有男性患者", "极氪成自驾游租车热门车型", "胖东升员工称名字是老板随便起的", "极氪或将从美国纽交所退市", "台学生因在南京出生报考台军医遭拒", "巴方宣布1天击落3架“阵风”战机", "印度媒体发布印巴军事实力对比", "刘德华回应女儿“炫父”", "郑州一单位疑强制捐款 编制内多捐20", "男子辞职照顾智力退化到2岁的妈妈", "胖东升否认抄袭胖东来 已开店十几年", "硅业分会：市场供需基本面未好转", "最先混进老年徒步团的已经进骨科了", "胡兵团队在西班牙被“飞车党”抢包", "全红婵老家盖别墅 无人机满天飞", "解放军仪仗司礼官兵训练画面曝光", "苟伟死因曝光 鼻息肉肥大致呼吸骤停", "专家：美航母高强度作战致人机俱疲", "美国宣布与也门胡塞武装停火", "伊能静第一次看到儿子化妆"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
