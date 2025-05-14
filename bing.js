// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.47
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
var default_search_words = ["中拉十年合作跑出“加速度”", "山西订婚强奸案入选最高法案例", "国台办回应特朗普突然提到“统一”", "这次部长级会议为何多国元首都来了", "人民日报评京东美团等平台被约谈", "赖清德称与日本像家人 国台办回应", "女子称穿瑜伽服上门做饭不是为流量", "特朗普提统一 台退将：台湾就是棋子", "央视冠军歌手回老家摆摊照顾父亲", "桥下躲冰雹致堵车该不该担责", "小龙虾价格腰斩 业内：还会再降", "5岁男童被拐家属悬赏50万？假", "北京交警回应桥下躲冰雹致堵车", "夫妻俩制假币每天印多少花多少", "外交部：中方对美芬太尼反制仍然有效", "关晓彤左手无名指戴戒指", "男子爱喝啤酒吃海鲜 患痛风双手变形", "赵丽颖赵德胤恋爱细节", "93年女子嫁65年丈夫 当事人发声", "美国和沙特签署上千亿美元军售协议", "郑秀文演唱会秀腹肌", "赵丽颖新恋情曝光", "中方回应对藏南地区多处地点重命名", "#赵丽颖和赵德胤恋情是真的吗#", "为救同学缺考男生获评见义勇为", "印巴谁赢了？发布会这7秒说明了很多", "小伙缺考一门救下同学一命", "多名在英国中国公民失踪失联", "搞权色钱色交易 陆克华被决定逮捕", "泽连斯基：全面停火和换俘是主要议题", "印度议员：阵风坠落就像受伤的小鸟", "女子结婚多年5次备孕生580克宝宝", "杨瀚森联合试训表现", "陕西省工信厅原副厅长蔡苏昌被查", "许昕：我和邱贻可能玩一块去", "姜同学你在人生大考中已获满分", "赵德胤有赵丽颖小区门禁卡", "《歌手2025》首发阵容官宣", "骑士被步行者淘汰暴露出哪些短板", "律师称克里西已涉嫌猥亵", "曝安切洛蒂希望卡卡加入巴西教练组", "哪吒汽车关联公司10亿股权被冻结", "中国对美关税开始调整", "邱贻可女儿和孙颖莎见面总拥抱", "男孩把三角尺塞进嘴中被卡", "女子三年生三胎后又怀上三胞胎", "美国对华小包裹关税被曝再次降低", "戛纳红毯上中国明星的造型好亮眼", "日本自卫队一架飞机失联", "湖南郴州发现比熊猫血还稀有的血型", "徐芝文任四川省政府党组成员"]

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
